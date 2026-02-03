import { eq } from "drizzle-orm"
import type { DrizzleClient } from "@/db"
import type { NewProfile } from "@/db/schema"
import {
  accounts,
  budgets,
  categories,
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
      // Budget lines will be cascade deleted with budgets
      await tx.delete(budgets).where(eq(budgets.user_id, userId))

      // Delete transactions
      await tx.delete(transactions).where(eq(transactions.user_id, userId))

      // Delete accounts
      await tx.delete(accounts).where(eq(accounts.user_id, userId))

      // Delete categories
      await tx.delete(categories).where(eq(categories.user_id, userId))

      // Finally, delete the profile
      await tx.delete(profiles).where(eq(profiles.user_id, userId))

      // Note: The actual Supabase auth user deletion should be handled
      // separately via Supabase Admin API or Edge Function

      return { success: true }
    })
  }
}
