import { eq } from "drizzle-orm"
import type { DrizzleClient } from "@/db"
import type { NewProfile } from "@/db/schema"
import {
  accounts,
  accountsUsers,
  aiReports,
  banksUsers,
  budgetLines,
  budgets,
  categories,
  chatConversations,
  profiles,
  transactions,
} from "@/db/schema"

export class UserService {
  static async getProfile(db: DrizzleClient, userId: string) {
    return await db.query.profiles.findFirst({
      where: eq(profiles.user_id, userId),
    })
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
