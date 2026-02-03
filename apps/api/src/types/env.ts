import type { DrizzleClient } from "@/db"

export interface Env {
  DATABASE_URL: string
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  SUPABASE_JWT_SECRET: string
  ENVIRONMENT: "development" | "staging" | "production"
}

export interface Variables {
  db: DrizzleClient
  userId: string
  userEmail?: string
  requestId: string
}

export interface AppEnv {
  Bindings: Env
  Variables: Variables
}
