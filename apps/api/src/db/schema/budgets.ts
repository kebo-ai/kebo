import {
  boolean,
  date,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"
import { categories } from "./categories"

export const budgets = pgTable("budgets_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(),
  is_active: boolean("is_active").default(true).notNull(),
  is_recurrent: boolean("is_recurrent").default(true).notNull(),
  custom_name: text("custom_name"),
  budget_amount: numeric("budget_amount"),
  start_date: date("start_date"),
  end_date: date("end_date"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  deleted_at: timestamp("deleted_at"),
  is_deleted: boolean("is_deleted").default(false).notNull(),
})

export const budgetLines = pgTable("budget_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  budget_id: uuid("budget_id")
    .notNull()
    .references(() => budgets.id),
  user_id: uuid("user_id").notNull(),
  category_id: uuid("category_id")
    .notNull()
    .references(() => categories.id),
  amount: numeric("amount").notNull(),
  created_at: timestamp("created_at").notNull(),
  updated_at: timestamp("updated_at").notNull(),
  deleted_at: timestamp("deleted_at"),
  is_deleted: boolean("is_deleted").default(false).notNull(),
})

export const insertBudgetSchema = createInsertSchema(budgets)
export const selectBudgetSchema = createSelectSchema(budgets)
export const insertBudgetLineSchema = createInsertSchema(budgetLines)
export const selectBudgetLineSchema = createSelectSchema(budgetLines)

export const upsertBudgetSchema = z.object({
  id: z.string().uuid().optional(),
  custom_name: z.string().max(100).optional(),
  budget_amount: z
    .union([z.string(), z.number()])
    .transform((val) => String(val)),
  start_date: z.string(),
  end_date: z.string(),
  is_active: z.boolean().optional().default(true),
  is_recurrent: z.boolean().optional().default(false),
  budget_lines: z
    .array(
      z.object({
        category_id: z.string().uuid(),
        amount: z
          .union([z.string(), z.number()])
          .transform((val) => String(val)),
      }),
    )
    .optional()
    .default([]),
})

export type Budget = typeof budgets.$inferSelect
export type NewBudget = typeof budgets.$inferInsert
export type BudgetLine = typeof budgetLines.$inferSelect
export type NewBudgetLine = typeof budgetLines.$inferInsert
export type UpsertBudgetInput = z.infer<typeof upsertBudgetSchema>
