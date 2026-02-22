import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm"
import type { DrizzleClient } from "@/db"
import type { NewTransaction } from "@/db/schema"
import { accounts, banks, categories, transactions } from "@/db/schema"

// Credit card account type ID - balance is inverted for this type
const CREDIT_CARD_ACCOUNT_TYPE_ID = "aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaaa"

interface ListTransactionsParams {
  page: number
  limit: number
  transactionType?: string
  startDate?: string
  endDate?: string
  accountIds?: string[]
  categoryIds?: string[]
}

interface CreateTransferParams {
  fromAccountId: string
  toAccountId: string
  amount: string
  description?: string
  date: string
}

export class TransactionService {
  /**
   * Helper to build the select fields for transactions with details
   * Replaces the transactions_with_details view with explicit Drizzle joins
   */
  private static getTransactionWithDetailsSelect() {
    return {
      // Transaction fields
      id: transactions.id,
      amount: transactions.amount,
      currency: transactions.currency,
      date: transactions.date,
      description: transactions.description,
      transaction_type: transactions.transaction_type,
      is_recurring: transactions.is_recurring,
      recurrence_cadence: transactions.recurrence_cadence,
      recurrence_end_date: transactions.recurrence_end_date,
      created_at: transactions.created_at,
      updated_at: transactions.updated_at,
      is_deleted: transactions.is_deleted,
      metadata: transactions.metadata,
      // Category fields
      category_id: categories.id,
      category_name: categories.name,
      category_icon_url: categories.icon_url,
      category_icon_emoji: categories.icon_emoji,
      category_color_id: categories.color_id,
      // Account fields
      account_id: accounts.id,
      account_name: accounts.name,
      account_balance: accounts.balance,
      // Bank fields
      bank_id: banks.id,
      bank_name: banks.name,
      bank_url: banks.bank_url,
    }
  }

  static async list(
    db: DrizzleClient,
    userId: string,
    params: ListTransactionsParams,
  ) {
    const {
      page,
      limit,
      transactionType,
      startDate,
      endDate,
      accountIds,
      categoryIds,
    } = params
    const offset = (page - 1) * limit

    // Build dynamic where conditions - always filter by userId
    const conditions = [
      eq(transactions.user_id, userId),
      eq(transactions.is_deleted, false),
    ]

    if (transactionType) {
      conditions.push(eq(transactions.transaction_type, transactionType as any))
    }
    if (startDate) {
      conditions.push(gte(transactions.date, new Date(startDate)))
    }
    if (endDate) {
      conditions.push(lte(transactions.date, new Date(endDate)))
    }
    if (accountIds && accountIds.length > 0) {
      conditions.push(inArray(transactions.account_id, accountIds))
    }
    if (categoryIds && categoryIds.length > 0) {
      conditions.push(inArray(transactions.category_id, categoryIds))
    }

    const [data, countResult] = await Promise.all([
      db
        .select(TransactionService.getTransactionWithDetailsSelect())
        .from(transactions)
        .leftJoin(
          categories,
          and(
            eq(transactions.category_id, categories.id),
            eq(categories.is_deleted, false),
          ),
        )
        .leftJoin(
          accounts,
          and(
            eq(transactions.account_id, accounts.id),
            eq(accounts.is_deleted, false),
          ),
        )
        .leftJoin(
          banks,
          and(eq(accounts.bank_id, banks.id), eq(banks.is_deleted, false)),
        )
        .where(and(...conditions))
        .orderBy(desc(transactions.date))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(transactions)
        .where(and(...conditions)),
    ])

    const total = Number(countResult[0]?.count ?? 0)

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  static async getById(db: DrizzleClient, userId: string, id: string) {
    const result = await db
      .select(TransactionService.getTransactionWithDetailsSelect())
      .from(transactions)
      .leftJoin(
        categories,
        and(
          eq(transactions.category_id, categories.id),
          eq(categories.is_deleted, false),
        ),
      )
      .leftJoin(
        accounts,
        and(
          eq(transactions.account_id, accounts.id),
          eq(accounts.is_deleted, false),
        ),
      )
      .leftJoin(
        banks,
        and(eq(accounts.bank_id, banks.id), eq(banks.is_deleted, false)),
      )
      .where(
        and(
          eq(transactions.id, id),
          eq(transactions.user_id, userId),
          eq(transactions.is_deleted, false),
        ),
      )
      .limit(1)

    return result[0] ?? null
  }

  static async create(
    db: DrizzleClient,
    userId: string,
    data: Omit<NewTransaction, "id" | "user_id" | "created_at" | "updated_at">,
  ) {
    const [result] = await db
      .insert(transactions)
      .values({
        ...data,
        user_id: userId,
      })
      .returning()

    return result
  }

  static async update(
    db: DrizzleClient,
    userId: string,
    id: string,
    data: Partial<Omit<NewTransaction, "id" | "user_id" | "created_at">>,
  ) {
    const [result] = await db
      .update(transactions)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(and(eq(transactions.id, id), eq(transactions.user_id, userId)))
      .returning()

    return result ?? null
  }

  static async softDelete(db: DrizzleClient, userId: string, id: string) {
    const [result] = await db
      .update(transactions)
      .set({
        is_deleted: true,
        deleted_at: new Date(),
        updated_at: new Date(),
      })
      .where(and(eq(transactions.id, id), eq(transactions.user_id, userId)))
      .returning()

    return result ?? null
  }

  static async getRecurring(db: DrizzleClient, userId: string) {
    return await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.user_id, userId),
          eq(transactions.is_recurring, true),
          eq(transactions.is_deleted, false),
        ),
      )
      .orderBy(desc(transactions.date))
  }

  static async createTransfer(
    db: DrizzleClient,
    userId: string,
    params: CreateTransferParams,
  ) {
    return await db.transaction(async (tx) => {
      // Create the main transfer transaction
      const [transferTx] = await tx
        .insert(transactions)
        .values({
          user_id: userId,
          account_id: params.fromAccountId,
          to_account_id: params.toAccountId,
          transaction_type: "Transfer",
          amount: params.amount,
          currency: "USD", // Default currency
          description: params.description ?? "Transfer",
          date: new Date(params.date),
        })
        .returning()

      return transferTx
    })
  }

  /**
   * Get user balance by calculating from transactions and accounts
   * Replaces the user_balance view with explicit Drizzle queries
   */
  static async getBalance(db: DrizzleClient, userId: string) {
    // Calculate transactions balance (Income adds, Expense subtracts)
    // Must join with accounts to exclude deleted accounts
    const [txResult] = await db
      .select({
        total: sql<string>`COALESCE(SUM(
          CASE 
            WHEN ${transactions.transaction_type} = 'Expense' THEN -1 * ${transactions.amount}
            ELSE ${transactions.amount}
          END
        ), 0)`,
      })
      .from(transactions)
      .innerJoin(accounts, eq(transactions.account_id, accounts.id))
      .where(
        and(
          eq(transactions.user_id, userId),
          eq(transactions.is_deleted, false),
          eq(accounts.is_deleted, false),
        ),
      )

    // Calculate accounts balance (Credit cards have inverted balance)
    const [accResult] = await db
      .select({
        total: sql<string>`COALESCE(SUM(
          CASE 
            WHEN ${accounts.account_type_id} = ${CREDIT_CARD_ACCOUNT_TYPE_ID}
            THEN ${accounts.balance} * -1
            ELSE ${accounts.balance}
          END
        ), 0)`,
      })
      .from(accounts)
      .where(and(eq(accounts.user_id, userId), eq(accounts.is_deleted, false)))

    const transactionsTotal = txResult?.total ?? "0"
    const accountsTotal = accResult?.total ?? "0"
    const totalBalance = (
      parseFloat(transactionsTotal) + parseFloat(accountsTotal)
    ).toFixed(2)

    return {
      total_balance: totalBalance,
      transactions_total: transactionsTotal,
      accounts_total: accountsTotal,
    }
  }
}
