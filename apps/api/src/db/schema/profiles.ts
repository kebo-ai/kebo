import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().unique(),
  full_name: varchar("full_name", { length: 255 }),
  avatar_url: text("avatar_url"),
  email: varchar("email", { length: 255 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  country: varchar("country", { length: 2 }),
  timezone: varchar("timezone", { length: 50 }),
  language: varchar("language", { length: 5 }).default("en"),
  phone: varchar("phone", { length: 50 }),
  email_notifications: boolean("email_notifications").default(true),
  push_notifications: boolean("push_notifications").default(true),
  device_properties: jsonb("device_properties"),
  user_consent: jsonb("user_consent"),
  has_user_clicked_rate_modal: boolean("has_user_clicked_rate_modal").default(
    false,
  ),
  last_shown_rating_milestone: integer("last_shown_rating_milestone").default(
    0,
  ),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  is_deleted: boolean("is_deleted").default(false),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
})

export const insertProfileSchema = createInsertSchema(profiles)
export const selectProfileSchema = createSelectSchema(profiles)

export type Profile = typeof profiles.$inferSelect
export type NewProfile = typeof profiles.$inferInsert
