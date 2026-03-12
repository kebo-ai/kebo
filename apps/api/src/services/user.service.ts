import { eq } from "drizzle-orm"
import type { DrizzleClient } from "@/db"
import type { NewProfile } from "@/db/schema"
import {
  accounts,
  accountsUsers,
  accountTypes,
  aiReports,
  banks,
  banksUsers,
  budgetLines,
  budgets,
  categories,
  chatConversations,
  globalCategories,
  profiles,
  transactions,
} from "@/db/schema"

export class UserService {
  static async getProfile(db: DrizzleClient, userId: string) {
    return await db.query.profiles.findFirst({
      where: eq(profiles.user_id, userId),
    })
  }

  static async ensureProfile(
    db: DrizzleClient,
    userId: string,
    meta?: { email?: string; full_name?: string; avatar_url?: string },
  ) {
    const existing = await this.getProfile(db, userId)
    if (existing) return existing

    const [created] = await db
      .insert(profiles)
      .values({
        user_id: userId,
        email: meta?.email,
        full_name: meta?.full_name,
        avatar_url: meta?.avatar_url,
      })
      .onConflictDoNothing({ target: profiles.user_id })
      .returning()

    // If we actually created a new profile, set up defaults
    if (created) {
      await this.setupDefaults(db, userId)
    }

    return created ?? (await this.getProfile(db, userId))
  }

  /** Create default account and categories for a new user */
  private static async setupDefaults(db: DrizzleClient, userId: string) {
    // 1. Create default "Efectivo" (Cash) account
    const [cashBank] = await db
      .select({ id: banks.id })
      .from(banks)
      .where(eq(banks.name, "Efectivo"))
      .limit(1)

    const [cashType] = await db
      .select({ id: accountTypes.id })
      .from(accountTypes)
      .where(eq(accountTypes.type_name, "Efectivo"))
      .limit(1)

    if (cashBank && cashType) {
      await db.insert(accounts).values({
        user_id: userId,
        name: "Efectivo",
        customized_name: "Efectivo",
        bank_id: cashBank.id,
        account_type_id: cashType.id,
        balance: "0",
        is_default: true,
        icon_url:
          "/storage/v1/object/public/banks/GLOBAL/category__default_cash.svg",
      })
    }

    // 2. Copy all active global categories to user's categories_users
    const globals = await db
      .select()
      .from(globalCategories)
      .where(eq(globalCategories.is_deleted, false))

    if (globals.length > 0) {
      await db.insert(categories).values(
        globals.map((g) => ({
          user_id: userId,
          category_id: g.id,
          type: g.type,
          name: g.name,
          icon_url: g.icon_url,
          color_id: g.color_id,
        })),
      )
    }
  }

  static async updateProfile(
    db: DrizzleClient,
    userId: string,
    data: Partial<
      Pick<NewProfile, "full_name" | "country" | "currency" | "avatar_url">
    >,
  ) {
    const [updated] = await db
      .update(profiles)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(eq(profiles.user_id, userId))
      .returning()

    return updated
  }

  static async hardDelete(db: DrizzleClient, userId: string) {
    return await db.transaction(async (tx) => {
      // Delete in order respecting foreign key constraints

      // 1. budget_lines → references budgets + categories
      await tx.delete(budgetLines).where(eq(budgetLines.user_id, userId))

      // 2. budgets
      await tx.delete(budgets).where(eq(budgets.user_id, userId))

      // 3. transactions → references accounts + categories
      await tx.delete(transactions).where(eq(transactions.user_id, userId))

      // 4. accounts_users → references accounts
      await tx.delete(accountsUsers).where(eq(accountsUsers.user_id, userId))

      // 5. banks_users → references accounts
      await tx.delete(banksUsers).where(eq(banksUsers.user_id, userId))

      // 6. accounts
      await tx.delete(accounts).where(eq(accounts.user_id, userId))

      // 7. categories
      await tx.delete(categories).where(eq(categories.user_id, userId))

      // 8. chat_conversations (messages cascade-delete)
      await tx
        .delete(chatConversations)
        .where(eq(chatConversations.user_id, userId))

      // 9. ai_reports
      await tx.delete(aiReports).where(eq(aiReports.user_id, userId))

      // 10. profile
      await tx.delete(profiles).where(eq(profiles.user_id, userId))

      // Note: The actual Supabase auth user deletion should be handled
      // separately via Supabase Admin API or Edge Function

      return { success: true }
    })
  }
}
