import { getApiClient, unwrap } from "../rpc"

const client = getApiClient()

export type ReviewAction = "rated" | "dismissed" | "later"

export interface ReviewEligibility {
  eligible: boolean
  reason?: string
  currentMilestone?: number
  transactionCount?: number
  accountAgeDays?: number
}

export async function checkReviewEligibility(): Promise<ReviewEligibility> {
  return unwrap<ReviewEligibility>(await client.reviews.eligibility.$get())
}

export async function recordReviewAction(action: ReviewAction) {
  return unwrap<unknown>(
    await client.reviews.action.$post({ json: { action } })
  )
}
