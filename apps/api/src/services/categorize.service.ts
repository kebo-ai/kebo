import { z } from "zod"
import { generateText, Output } from "ai"
import { createGateway } from "@ai-sdk/gateway"

const categorizeOutputSchema = z.object({
  category_id: z.string().describe("The ID of the best matching category"),
  account_id: z
    .string()
    .describe("The ID of the most likely account for this card/purchase"),
  description: z
    .string()
    .describe("A clean 5-7 word summary of the purchase"),
})

export type CategorizeInput = {
  merchant: string
  transactionName?: string
  cardName?: string
  amount: string
  currency: string
  categories: Array<{ id: string; name: string; icon_emoji: string | null }>
  accounts: Array<{ id: string; name: string; bank_name: string | null }>
}

export type CategorizeOutput = z.infer<typeof categorizeOutputSchema>

function buildPrompt(input: CategorizeInput): string {
  const categoryList = input.categories
    .map((c) => `- ${c.icon_emoji || "•"} ${c.name} (id: ${c.id})`)
    .join("\n")

  const accountList = input.accounts
    .map(
      (a) => `- ${a.name}${a.bank_name ? ` - ${a.bank_name}` : ""} (id: ${a.id})`,
    )
    .join("\n")

  return `You categorize Apple Pay transactions for a personal finance app.
Pick the best category AND account for this transaction.

Transaction:
- Merchant: ${input.merchant}
${input.transactionName ? `- Name: ${input.transactionName}` : ""}
${input.cardName ? `- Card used: ${input.cardName}` : ""}
- Amount: ${input.amount} ${input.currency}

Categories:
${categoryList}

Accounts:
${accountList}

Rules:
- Pick exactly one category_id from the list above
- Pick exactly one account_id from the list above
- For account, match the card name to the most likely account (bank name, account name)
- For description, write a clean 5-7 word summary (e.g. "Coffee", "Grocery shopping", "Uber ride")`
}

export class CategorizeService {
  private gateway

  constructor(apiKey: string) {
    this.gateway = createGateway({ apiKey })
  }

  async categorize(input: CategorizeInput): Promise<CategorizeOutput | null> {
    try {
      const abortController = new AbortController()
      const timeout = setTimeout(() => abortController.abort(), 4000)

      const { output } = await generateText({
        model: this.gateway("openai/gpt-oss-20b"),
        output: Output.object({ schema: categorizeOutputSchema }),
        prompt: buildPrompt(input),
        abortSignal: abortController.signal,
      })

      clearTimeout(timeout)
      return output ?? null
    } catch {
      return null
    }
  }
}
