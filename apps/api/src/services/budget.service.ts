import { and, between, desc, eq, sum } from "drizzle-orm"
import type { DrizzleClient } from "@/db"
import type { UpsertBudgetInput } from "@/db/schema"
import { budgetLines, budgets, transactions } from "@/db/schema"

export class BudgetService {
  static async list(db: DrizzleClient, userId: string) {
    const budgetList = await db.query.budgets.findMany({
      where: and(eq(budgets.user_id, userId), eq(budgets.is_deleted, false)),
      with: {
        lines: {
          with: {
            category: true,
          },
        },
      },
      orderBy: [desc(budgets.created_at)],
    })

    // Calculate spent amounts for each budget
    const budgetsWithSpent = await Promise.all(
      budgetList.map(async (budget) => {
        const startDate = budget.start_date
          ? new Date(budget.start_date)
          : new Date()
        const endDate = budget.end_date ? new Date(budget.end_date) : new Date()

        // Get all expense transactions in budget period for categories in budget lines
        const categoryIds = budget.lines.map((line) => line.category_id)

        if (categoryIds.length === 0) {
          return {
            ...budget,
            total_spent: "0",
            total_remaining: budget.budget_amount ?? "0",
            progress_percentage: "0",
          }
        }

        // Sum all expenses for all categories in the budget period
        const [spentResult] = await db
          .select({ total: sum(transactions.amount) })
          .from(transactions)
          .where(
            and(
              eq(transactions.user_id, userId),
              eq(transactions.transaction_type, "Expense"),
              eq(transactions.is_deleted, false),
              between(transactions.date, startDate, endDate),
              // Filter by categories in budget lines
              // Using SQL IN clause equivalent
            ),
          )

        // Actually need to filter by category_ids - let me do a proper query
        let totalSpent = 0
        for (const line of budget.lines) {
          const [lineSpent] = await db
            .select({ total: sum(transactions.amount) })
            .from(transactions)
            .where(
              and(
                eq(transactions.user_id, userId),
                eq(transactions.category_id, line.category_id),
                eq(transactions.transaction_type, "Expense"),
                eq(transactions.is_deleted, false),
                between(transactions.date, startDate, endDate),
              ),
            )
          totalSpent += parseFloat(lineSpent?.total ?? "0")
        }

        const budgetAmount = parseFloat(budget.budget_amount ?? "0")
        const remaining = budgetAmount - totalSpent

        return {
          ...budget,
          total_spent: totalSpent.toFixed(2),
          total_remaining: remaining.toFixed(2),
          progress_percentage:
            budgetAmount > 0
              ? ((totalSpent / budgetAmount) * 100).toFixed(2)
              : "0",
        }
      }),
    )

    return budgetsWithSpent
  }

  static async getById(db: DrizzleClient, userId: string, id: string) {
    const budget = await db.query.budgets.findFirst({
      where: and(
        eq(budgets.id, id),
        eq(budgets.user_id, userId),
        eq(budgets.is_deleted, false),
      ),
      with: {
        lines: {
          with: {
            category: true,
          },
        },
      },
    })

    if (!budget) return null

    // Calculate spent amounts for each line
    const linesWithSpent = await Promise.all(
      budget.lines.map(async (line) => {
        const startDate = budget.start_date
          ? new Date(budget.start_date)
          : new Date()
        const endDate = budget.end_date ? new Date(budget.end_date) : new Date()

        const [spentResult] = await db
          .select({ total: sum(transactions.amount) })
          .from(transactions)
          .where(
            and(
              eq(transactions.user_id, userId),
              eq(transactions.category_id, line.category_id),
              eq(transactions.transaction_type, "Expense"),
              eq(transactions.is_deleted, false),
              between(transactions.date, startDate, endDate),
            ),
          )

        const spentAmount = spentResult?.total ?? "0"
        const allocatedAmount = parseFloat(line.amount)
        const spent = parseFloat(spentAmount)

        return {
          ...line,
          category_name: line.category?.name,
          icon_emoji: line.category?.icon_emoji,
          spent_amount: spentAmount,
          remaining_amount: (allocatedAmount - spent).toFixed(2),
          progress_percentage:
            allocatedAmount > 0
              ? ((spent / allocatedAmount) * 100).toFixed(2)
              : "0",
        }
      }),
    )

    // Calculate totals
    const totalBudget = parseFloat(budget.budget_amount ?? "0")
    const totalSpent = linesWithSpent.reduce(
      (acc, line) => acc + parseFloat(line.spent_amount),
      0,
    )

    return {
      ...budget,
      budget_lines: linesWithSpent,
      total_metrics: {
        total_budget: budget.budget_amount,
        total_spent: totalSpent.toFixed(2),
        total_remaining: (totalBudget - totalSpent).toFixed(2),
        overall_progress_percentage:
          totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(2) : "0",
      },
    }
  }

  static async upsert(
    db: DrizzleClient,
    userId: string,
    params: UpsertBudgetInput,
  ) {
    return await db.transaction(async (tx) => {
      let budgetId: string

      if (params.id) {
        // Update existing budget
        const [updated] = await tx
          .update(budgets)
          .set({
            custom_name: params.custom_name,
            budget_amount: params.budget_amount,
            start_date: params.start_date,
            end_date: params.end_date,
            is_active: params.is_active,
            is_recurrent: params.is_recurrent,
            updated_at: new Date(),
          })
          .where(and(eq(budgets.id, params.id), eq(budgets.user_id, userId)))
          .returning()

        if (!updated) {
          throw new Error("Budget not found")
        }

        budgetId = updated.id

        // Delete existing lines
        await tx.delete(budgetLines).where(eq(budgetLines.budget_id, budgetId))
      } else {
        // Create new budget
        const [created] = await tx
          .insert(budgets)
          .values({
            user_id: userId,
            custom_name: params.custom_name,
            budget_amount: params.budget_amount,
            start_date: params.start_date,
            end_date: params.end_date,
            is_active: params.is_active,
            is_recurrent: params.is_recurrent,
          })
          .returning()

        budgetId = created.id
      }

      // Insert budget lines
      if (params.budget_lines && params.budget_lines.length > 0) {
        await tx.insert(budgetLines).values(
          params.budget_lines.map((line) => ({
            budget_id: budgetId,
            user_id: userId,
            category_id: line.category_id,
            amount: line.amount,
            created_at: new Date(),
            updated_at: new Date(),
          })),
        )
      }

      // Return the complete budget
      return await BudgetService.getById(
        tx as unknown as DrizzleClient,
        userId,
        budgetId,
      )
    })
  }

  static async delete(db: DrizzleClient, userId: string, id: string) {
    const [result] = await db
      .update(budgets)
      .set({
        is_deleted: true,
        deleted_at: new Date(),
        updated_at: new Date(),
      })
      .where(and(eq(budgets.id, id), eq(budgets.user_id, userId)))
      .returning()

    if (!result) {
      throw new Error("Budget not found")
    }

    return true
  }

  static async getCategoryDetails(
    db: DrizzleClient,
    userId: string,
    budgetId: string,
    categoryId: string,
  ) {
    const budget = await db.query.budgets.findFirst({
      where: and(eq(budgets.id, budgetId), eq(budgets.user_id, userId)),
    })

    if (!budget) {
      throw new Error("Budget not found")
    }

    const line = await db.query.budgetLines.findFirst({
      where: and(
        eq(budgetLines.budget_id, budgetId),
        eq(budgetLines.category_id, categoryId),
      ),
      with: {
        category: true,
      },
    })

    if (!line) {
      throw new Error("Budget line not found")
    }

    const startDate = budget.start_date
      ? new Date(budget.start_date)
      : new Date()
    const endDate = budget.end_date ? new Date(budget.end_date) : new Date()

    // Get transactions for this category within budget period
    const categoryTransactions = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.user_id, userId),
          eq(transactions.category_id, categoryId),
          eq(transactions.transaction_type, "Expense"),
          eq(transactions.is_deleted, false),
          between(transactions.date, startDate, endDate),
        ),
      )
      .orderBy(desc(transactions.date))

    // Calculate spent amount
    const [spentResult] = await db
      .select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(
        and(
          eq(transactions.user_id, userId),
          eq(transactions.category_id, categoryId),
          eq(transactions.transaction_type, "Expense"),
          eq(transactions.is_deleted, false),
          between(transactions.date, startDate, endDate),
        ),
      )

    const spentAmount = spentResult?.total ?? "0"
    const allocatedAmount = parseFloat(line.amount)
    const spent = parseFloat(spentAmount)

    return {
      category: line.category,
      allocatedAmount: line.amount,
      spentAmount,
      remainingAmount: (allocatedAmount - spent).toFixed(2),
      progressPercentage:
        allocatedAmount > 0
          ? ((spent / allocatedAmount) * 100).toFixed(2)
          : "0",
      transactions: categoryTransactions,
    }
  }
}
