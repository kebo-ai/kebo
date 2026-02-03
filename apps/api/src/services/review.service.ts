import { and, eq, sql } from "drizzle-orm"
import type { DrizzleClient } from "@/db"
import { profiles, transactions } from "@/db/schema"

export class ReviewService {
  static async checkEligibility(db: DrizzleClient, userId: string) {
    // Get user profile for account age and rating status
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.user_id, userId),
    })

    if (!profile) {
      return { eligible: false, reason: "User not found" }
    }

    // Check if user has already clicked the rate modal
    if (profile.has_user_clicked_rate_modal) {
      return { eligible: false, reason: "Already rated" }
    }

    // Check account age (minimum 7 days)
    const createdAt = profile.created_at ?? new Date()
    const accountAgeMs = Date.now() - new Date(createdAt).getTime()
    const accountAgeDays = accountAgeMs / (1000 * 60 * 60 * 24)

    if (accountAgeDays < 7) {
      return { eligible: false, reason: "Account too new" }
    }

    // Check transaction count (minimum 10 transactions)
    const [txCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(transactions)
      .where(
        and(
          eq(transactions.user_id, userId),
          eq(transactions.is_deleted, false),
        ),
      )

    if ((txCount?.count ?? 0) < 10) {
      return { eligible: false, reason: "Not enough transactions" }
    }

    // Check milestone-based eligibility
    const currentMilestone =
      txCount?.count && txCount.count >= 5
        ? txCount.count <= 10
          ? 10
          : Math.ceil(txCount.count / 10) * 10
        : 5

    if (
      profile.last_shown_rating_milestone &&
      currentMilestone <= profile.last_shown_rating_milestone
    ) {
      return { eligible: false, reason: "Milestone not reached" }
    }

    return { eligible: true, currentMilestone }
  }

  static async recordInteraction(
    db: DrizzleClient,
    userId: string,
    action: "rated" | "dismissed" | "later",
    currentMilestone?: number,
  ) {
    // Update profile based on action
    const updateData: {
      has_user_clicked_rate_modal?: boolean
      last_shown_rating_milestone?: number
      updated_at: Date
    } = {
      updated_at: new Date(),
    }

    if (action === "rated") {
      updateData.has_user_clicked_rate_modal = true
    }

    if (currentMilestone) {
      updateData.last_shown_rating_milestone = currentMilestone
    }

    const [result] = await db
      .update(profiles)
      .set(updateData)
      .where(eq(profiles.user_id, userId))
      .returning()

    return result
  }
}
