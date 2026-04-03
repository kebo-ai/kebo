import { and, eq, sql } from "drizzle-orm"
import type { DrizzleClient } from "@/db"
import { accounts, categories, banks } from "@/db/schema"

export type UserFinancialContext = {
  categories: Array<{
    id: string
    name: string
    type: string
    icon_emoji: string | null
  }>
  accounts: Array<{
    id: string
    name: string
    is_default: boolean | null
    bank_name: string | null
  }>
}

/**
 * Fetches user's financial context (categories + accounts with bank names)
 * in a single parallel call. Reusable across AI services (categorization, chat, etc.)
 */
export async function fetchUserFinancialContext(
  db: DrizzleClient,
  userId: string,
  options?: { categoryType?: "Income" | "Expense" | "Transfer" | "Investment" | "Other" },
): Promise<UserFinancialContext> {
  const categoryConditions = [
    eq(categories.user_id, userId),
    eq(categories.is_deleted, false),
    eq(categories.is_visible, true),
  ]
  if (options?.categoryType) {
    categoryConditions.push(eq(categories.type, options.categoryType))
  }

  const [userCategories, userAccounts] = await Promise.all([
    db
      .select({
        id: categories.id,
        name: categories.name,
        type: categories.type,
        icon_emoji: categories.icon_emoji,
      })
      .from(categories)
      .where(and(...categoryConditions)),
    db
      .select({
        id: accounts.id,
        name: accounts.name,
        is_default: accounts.is_default,
        bank_name: sql<string | null>`${banks.name}`.as("bank_name"),
      })
      .from(accounts)
      .leftJoin(banks, eq(accounts.bank_id, banks.id))
      .where(
        and(eq(accounts.user_id, userId), eq(accounts.is_deleted, false)),
      ),
  ])

  return {
    categories: userCategories.map((c) => ({
      id: c.id,
      name: c.name ?? "",
      type: c.type,
      icon_emoji: c.icon_emoji,
    })),
    accounts: userAccounts.map((a) => ({
      id: a.id,
      name: a.name,
      is_default: a.is_default,
      bank_name: a.bank_name,
    })),
  }
}
