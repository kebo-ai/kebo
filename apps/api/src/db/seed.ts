import { drizzle } from "drizzle-orm/postgres-js"
import { reset, seed } from "drizzle-seed"
import postgres from "postgres"
import * as schema from "./schema"

const CATEGORY_NAMES = {
  Expense: [
    "Food & Dining",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Bills & Utilities",
    "Health",
    "Education",
    "Personal Care",
  ],
  Income: ["Salary", "Freelance", "Investment Returns", "Other Income"],
  Transfer: ["Transfer"],
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is required")
  }

  const client = postgres(databaseUrl)
  const db = drizzle(client, { schema })

  console.log("Resetting database...")
  await reset(db, schema)

  console.log("Seeding database...")
  await seed(db, schema, { seed: 12345 }).refine((f) => ({
    // Reference data - Account Types
    accountTypes: {
      count: 5,
      columns: {
        name: f.valuesFromArray({
          values: ["Checking", "Savings", "Credit Card", "Cash", "Investment"],
        }),
        description: f.loremIpsum({ sentencesCount: 1 }),
        sortOrder: f.int({ minValue: 1, maxValue: 5 }),
      },
    },

    // Reference data - Banks
    banks: {
      count: 10,
      columns: {
        name: f.companyName(),
        country: f.valuesFromArray({
          values: ["US", "MX", "ES", "PE", "CO", "AR"],
        }),
      },
    },

    // User profiles (id must be provided - typically from Supabase Auth)
    profiles: {
      count: 5,
      columns: {
        id: f.uuid(), // Generate test UUIDs
        fullName: f.fullName(),
        email: f.email(),
        currency: f.valuesFromArray({ values: ["USD", "MXN", "EUR", "PEN"] }),
        country: f.valuesFromArray({ values: ["US", "MX", "ES", "PE"] }),
      },
      with: {
        accounts: 3,
        categories: 13, // 8 expense + 4 income + 1 transfer
      },
    },

    // Accounts (linked to profiles via `with`)
    accounts: {
      columns: {
        name: f.valuesFromArray({
          values: [
            "Main Account",
            "Savings",
            "Credit Card",
            "Cash",
            "Emergency Fund",
          ],
        }),
        initialBalance: f.number({
          minValue: 100,
          maxValue: 10000,
          precision: 100,
        }),
        currency: f.valuesFromArray({ values: ["USD", "MXN", "EUR"] }),
      },
    },

    // Categories (linked to profiles via `with`)
    categories: {
      columns: {
        name: f.valuesFromArray({
          values: [
            ...CATEGORY_NAMES.Expense,
            ...CATEGORY_NAMES.Income,
            ...CATEGORY_NAMES.Transfer,
          ],
        }),
        type: f.valuesFromArray({ values: ["Expense", "Income", "Transfer"] }),
        iconEmoji: f.valuesFromArray({
          values: [
            "🍔",
            "🚗",
            "🛒",
            "🎬",
            "💡",
            "🏥",
            "📚",
            "💇",
            "💰",
            "💼",
            "📈",
            "💵",
            "↔️",
          ],
        }),
      },
    },

    // Transactions - seeded separately after profiles/accounts/categories exist
    transactions: {
      count: 500,
      columns: {
        type: f.weightedRandom([
          { weight: 0.6, value: f.default({ defaultValue: "Expense" }) },
          { weight: 0.35, value: f.default({ defaultValue: "Income" }) },
          { weight: 0.05, value: f.default({ defaultValue: "Transfer" }) },
        ]),
        amount: f.number({ minValue: 5, maxValue: 500, precision: 100 }),
        description: f.loremIpsum({ sentencesCount: 1 }),
        date: f.date({ minDate: "2024-01-01", maxDate: "2025-12-31" }),
        isRecurring: f.weightedRandom([
          { weight: 0.9, value: f.default({ defaultValue: false }) },
          { weight: 0.1, value: f.default({ defaultValue: true }) },
        ]),
      },
    },
  }))

  await client.end()
  console.log("Seed completed!")
}

main().catch((error) => {
  console.error("Seed failed:", error)
  process.exit(1)
})
