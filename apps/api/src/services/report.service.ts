import {
  and,
  between,
  desc,
  eq,
  gte,
  isNull,
  lt,
  or,
  sql,
  sum,
} from "drizzle-orm"
import type { DrizzleClient } from "@/db"
import { categories, transactions } from "@/db/schema"

// Bar colors matching the mobile RPC
const BAR_COLORS = [
  "#8B5CF6",
  "#2E1065",
  "#7C3AED",
  "#A855F7",
  "#C084FC",
  "#DDD6FE",
  "#EDE9FE",
  "#F3F4F6",
]

type Granularity = "year" | "month" | "week"

interface IncomeExpenseParams {
  periodDate: string // YYYY-MM-DD format
  granularity: Granularity
}

interface ExpenseReportParams {
  periodDate: string // YYYY-MM-DD format
}

// Helper to format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]
}

// Helper to format date as YYYY-MM
function formatYearMonth(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

// Helper to get month abbreviation
function getMonthAbbr(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
}

// Helper to get period label based on granularity
function getPeriodLabel(date: Date, granularity: Granularity): string {
  switch (granularity) {
    case "year":
      return date.getFullYear().toString()
    case "month":
      return `${getMonthAbbr(date)} ${date.getFullYear()}`
    case "week": {
      const endOfWeek = new Date(date)
      endOfWeek.setDate(endOfWeek.getDate() + 6)
      return `${date.getDate()} - ${endOfWeek.getDate()} ${getMonthAbbr(endOfWeek)} ${endOfWeek.getFullYear().toString().slice(2)}`
    }
  }
}

// Helper to generate date series for time series data
function generateDateSeries(
  start: Date,
  end: Date,
  granularity: Granularity,
): Date[] {
  const dates: Date[] = []
  const current = new Date(start)

  while (current <= end) {
    dates.push(new Date(current))
    if (granularity === "year") {
      current.setMonth(current.getMonth() + 1)
    } else {
      current.setDate(current.getDate() + 1)
    }
  }
  return dates
}

export class ReportService {
  /**
   * Get expense report by category for a specific month
   * Matches get_expense_report_by_category RPC
   */
  static async getExpenseReportByCategory(
    db: DrizzleClient,
    userId: string,
    params: ExpenseReportParams,
  ) {
    const periodDate = new Date(params.periodDate)
    const periodStart = new Date(
      periodDate.getFullYear(),
      periodDate.getMonth(),
      1,
    )
    const periodEnd = new Date(
      periodDate.getFullYear(),
      periodDate.getMonth() + 1,
      1,
    )

    // Previous and next period navigation
    const prevPeriod = new Date(periodStart)
    prevPeriod.setMonth(prevPeriod.getMonth() - 1)
    const nextPeriod = new Date(periodStart)
    nextPeriod.setMonth(nextPeriod.getMonth() + 1)

    // Get category breakdown
    const result = await db
      .select({
        categoryId: categories.id,
        categoryName: categories.name,
        categoryIcon: categories.icon_url,
        categoryIconEmoji: categories.icon_emoji,
        totalAmount: sum(transactions.amount),
        transactionCount: sql<number>`count(*)::int`,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.category_id, categories.id))
      .where(
        and(
          eq(transactions.user_id, userId),
          eq(transactions.transaction_type, "Expense"),
          eq(transactions.is_deleted, false),
          or(isNull(categories.is_deleted), eq(categories.is_deleted, false)),
          gte(transactions.date, periodStart),
          lt(transactions.date, periodEnd),
          sql`${transactions.from_account_id} IS NULL`,
        ),
      )
      .groupBy(
        categories.id,
        categories.name,
        categories.icon_url,
        categories.icon_emoji,
      )
      .orderBy(desc(sql`sum(${transactions.amount})`))

    const totalExpense = result.reduce(
      (acc, row) => acc + parseFloat(row.totalAmount ?? "0"),
      0,
    )

    return {
      period: formatYearMonth(periodStart),
      period_label: `${getMonthAbbr(periodStart)} ${periodStart.getFullYear()}`,
      prev_period: formatYearMonth(prevPeriod),
      next_period: formatYearMonth(nextPeriod),
      total: totalExpense,
      data_categories: result.map((row, index) => ({
        id: row.categoryId,
        name: row.categoryName,
        icon: row.categoryIconEmoji || row.categoryIcon || "💰",
        amount: parseFloat(row.totalAmount ?? "0"),
        transaction_count: row.transactionCount,
        percentage:
          totalExpense > 0
            ? parseFloat(row.totalAmount ?? "0") / totalExpense
            : 0,
        bar_color: BAR_COLORS[index % BAR_COLORS.length],
      })),
    }
  }

  /**
   * Get comprehensive income/expense report with time series
   * Matches get_income_expense_report RPC
   */
  static async getIncomeExpenseReport(
    db: DrizzleClient,
    userId: string,
    params: IncomeExpenseParams,
  ) {
    const periodDate = new Date(params.periodDate)
    const { granularity } = params

    // Calculate period boundaries
    let periodStart: Date
    let periodEnd: Date
    let prevPeriod: string
    let nextPeriod: string

    switch (granularity) {
      case "year":
        periodStart = new Date(periodDate.getFullYear(), 0, 1)
        periodEnd = new Date(periodDate.getFullYear() + 1, 0, 1)
        prevPeriod = (periodDate.getFullYear() - 1).toString()
        nextPeriod = (periodDate.getFullYear() + 1).toString()
        break
      case "month": {
        periodStart = new Date(
          periodDate.getFullYear(),
          periodDate.getMonth(),
          1,
        )
        periodEnd = new Date(
          periodDate.getFullYear(),
          periodDate.getMonth() + 1,
          1,
        )
        const prevMonth = new Date(periodStart)
        prevMonth.setMonth(prevMonth.getMonth() - 1)
        const nextMonth = new Date(periodStart)
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        prevPeriod = formatYearMonth(prevMonth)
        nextPeriod = formatYearMonth(nextMonth)
        break
      }
      case "week": {
        // Get start of week (Monday)
        const dayOfWeek = periodDate.getDay()
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
        periodStart = new Date(periodDate)
        periodStart.setDate(periodDate.getDate() + diff)
        periodStart.setHours(0, 0, 0, 0)
        periodEnd = new Date(periodStart)
        periodEnd.setDate(periodEnd.getDate() + 7)
        const prevWeek = new Date(periodStart)
        prevWeek.setDate(prevWeek.getDate() - 7)
        const nextWeek = new Date(periodStart)
        nextWeek.setDate(nextWeek.getDate() + 7)
        prevPeriod = formatDate(prevWeek)
        nextPeriod = formatDate(nextWeek)
        break
      }
    }

    // Get all transactions in period
    const allTransactions = await db
      .select({
        date: transactions.date,
        transactionType: transactions.transaction_type,
        amount: transactions.amount,
        categoryId: categories.id,
        categoryName: categories.name,
        categoryIcon: categories.icon_url,
        categoryIconEmoji: categories.icon_emoji,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.category_id, categories.id))
      .where(
        and(
          eq(transactions.user_id, userId),
          eq(transactions.is_deleted, false),
          or(isNull(categories.is_deleted), eq(categories.is_deleted, false)),
          gte(transactions.date, periodStart),
          lt(transactions.date, periodEnd),
          sql`${transactions.from_account_id} IS NULL`,
        ),
      )

    // Calculate totals
    let totalIncome = 0
    let totalExpenses = 0
    const incomeByCategory: Record<
      string,
      { name: string; icon: string; amount: number; count: number }
    > = {}
    const expenseByCategory: Record<
      string,
      { name: string; icon: string; amount: number; count: number }
    > = {}

    // Time series aggregation
    const timeSeriesMap: Record<
      string,
      { income: number; expense: number; label: string }
    > = {}

    for (const tx of allTransactions) {
      const amount = parseFloat(tx.amount ?? "0")
      const txDate = new Date(tx.date)

      // Calculate time series key based on granularity
      let seriesKey: string
      let seriesLabel: string

      if (granularity === "year") {
        seriesKey = formatYearMonth(txDate)
        seriesLabel = getMonthAbbr(txDate)
      } else {
        seriesKey = formatDate(txDate)
        seriesLabel =
          granularity === "week"
            ? txDate.toLocaleDateString("en-US", { weekday: "short" })
            : txDate.getDate().toString()
      }

      if (!timeSeriesMap[seriesKey]) {
        timeSeriesMap[seriesKey] = { income: 0, expense: 0, label: seriesLabel }
      }

      // Use categoryId or fallback to "uncategorized"
      const catKey = tx.categoryId ?? "uncategorized"

      if (tx.transactionType === "Income") {
        totalIncome += amount
        timeSeriesMap[seriesKey].income += amount

        if (!incomeByCategory[catKey]) {
          incomeByCategory[catKey] = {
            name: tx.categoryName ?? "Uncategorized",
            icon: tx.categoryIconEmoji || tx.categoryIcon || "💰",
            amount: 0,
            count: 0,
          }
        }
        incomeByCategory[catKey].amount += amount
        incomeByCategory[catKey].count += 1
      } else if (tx.transactionType === "Expense") {
        totalExpenses += amount
        timeSeriesMap[seriesKey].expense += amount

        if (!expenseByCategory[catKey]) {
          expenseByCategory[catKey] = {
            name: tx.categoryName ?? "Uncategorized",
            icon: tx.categoryIconEmoji || tx.categoryIcon || "💰",
            amount: 0,
            count: 0,
          }
        }
        expenseByCategory[catKey].amount += amount
        expenseByCategory[catKey].count += 1
      }
    }

    // Generate complete time series with zeroes for missing dates
    const dateSeries = generateDateSeries(periodStart, periodEnd, granularity)
    const timeSeries = dateSeries
      .filter((d) => d < periodEnd)
      .map((date, index) => {
        let key: string
        let label: string

        if (granularity === "year") {
          key = formatYearMonth(date)
          label = getMonthAbbr(date)
        } else {
          key = formatDate(date)
          label =
            granularity === "week"
              ? date.toLocaleDateString("en-US", { weekday: "short" })
              : date.getDate().toString()
        }

        const data = timeSeriesMap[key] || { income: 0, expense: 0, label }
        return {
          period: key,
          period_label: data.label,
          income: data.income,
          expense: data.expense,
          net: data.income - data.expense,
          sort_order: index + 1,
        }
      })

    // Format category breakdowns
    const formatCategories = (
      categoryMap: Record<
        string,
        { name: string; icon: string; amount: number; count: number }
      >,
      total: number,
    ) => {
      return Object.entries(categoryMap)
        .sort((a, b) => b[1].amount - a[1].amount)
        .map(([id, data], index) => ({
          id,
          name: data.name,
          icon: data.icon,
          amount: data.amount,
          transaction_count: data.count,
          percentage: total > 0 ? data.amount / total : 0,
          bar_color: BAR_COLORS[index % BAR_COLORS.length],
        }))
    }

    const totalBalance = totalIncome - totalExpenses

    return {
      granularity,
      period:
        granularity === "year"
          ? periodStart.getFullYear().toString()
          : granularity === "month"
            ? formatYearMonth(periodStart)
            : formatDate(periodStart),
      period_label: getPeriodLabel(periodStart, granularity),
      prev_period: prevPeriod,
      next_period: nextPeriod,
      period_start: formatDate(periodStart),
      period_end: formatDate(new Date(periodEnd.getTime() - 1)), // Inclusive end date
      summary: {
        total_income: totalIncome,
        total_expenses: totalExpenses,
        total_balance: totalBalance,
        net_savings_rate: totalIncome > 0 ? totalBalance / totalIncome : 0,
      },
      time_series: timeSeries,
      categories: {
        income: formatCategories(incomeByCategory, totalIncome),
        expenses: formatCategories(expenseByCategory, totalExpenses),
      },
    }
  }
}
