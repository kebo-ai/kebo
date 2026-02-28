import { relations } from "drizzle-orm";
import {
  boolean,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(), // nanoid(10)
  creatorFingerprint: text("creator_fingerprint").notNull(),
  title: text("title"),
  currency: text("currency").notNull().default("USD"),
  tax: numeric("tax", { precision: 10, scale: 2 }).notNull().default("0"),
  tip: numeric("tip", { precision: 10, scale: 2 }).notNull().default("0"),
  status: text("status", { enum: ["active", "paid"] })
    .notNull()
    .default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const items = pgTable("items", {
  id: text("id").primaryKey(), // nanoid()
  sessionId: text("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 })
    .notNull()
    .default("1"),
  isShared: boolean("is_shared").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const members = pgTable("members", {
  id: text("id").primaryKey(), // nanoid()
  sessionId: text("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),
  fingerprint: text("fingerprint").notNull(),
  name: text("name").notNull(),
  avatarSeed: text("avatar_seed").notNull(),
  isCreator: boolean("is_creator").notNull().default(false),
  isPaid: boolean("is_paid").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const claims = pgTable(
  "claims",
  {
    itemId: text("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    memberId: text("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.itemId, t.memberId] })]
);

// Relations
export const sessionsRelations = relations(sessions, ({ many }) => ({
  items: many(items),
  members: many(members),
}));

export const itemsRelations = relations(items, ({ one, many }) => ({
  session: one(sessions, {
    fields: [items.sessionId],
    references: [sessions.id],
  }),
  claims: many(claims),
}));

export const membersRelations = relations(members, ({ one, many }) => ({
  session: one(sessions, {
    fields: [members.sessionId],
    references: [sessions.id],
  }),
  claims: many(claims),
}));

export const claimsRelations = relations(claims, ({ one }) => ({
  item: one(items, {
    fields: [claims.itemId],
    references: [items.id],
  }),
  member: one(members, {
    fields: [claims.memberId],
    references: [members.id],
  }),
}));
