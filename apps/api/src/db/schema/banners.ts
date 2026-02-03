import {
  boolean,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

export const dynamicBanners = pgTable("dynamic_banners", {
  id: uuid("id").primaryKey().defaultRandom(),
  banner: jsonb("banner").notNull(),
  visible: boolean("visible").default(true),
  language: varchar("language", { length: 5 }),
  app_version: varchar("app_version", { length: 20 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
})

export const insertBannerSchema = createInsertSchema(dynamicBanners)
export const selectBannerSchema = createSelectSchema(dynamicBanners)

export type DynamicBanner = typeof dynamicBanners.$inferSelect
export type NewDynamicBanner = typeof dynamicBanners.$inferInsert
