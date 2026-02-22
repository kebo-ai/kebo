import { drizzle } from "drizzle-orm/postgres-js"
import type postgres from "postgres"
import * as schema from "./schema"

export type DrizzleClient = ReturnType<typeof drizzle<typeof schema>>

export function createDb(client: postgres.Sql) {
  return drizzle(client, { schema })
}

export * from "./schema"
