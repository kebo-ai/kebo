import type { DrizzleClient } from "@/db"

export interface Env {
  DATABASE_URL: string
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  SUPABASE_JWT_SECRET: string
  ENVIRONMENT: "development" | "staging" | "production"
  // AI-related variables
  AI_GATEWAY_API_KEY: string
  ADMIN_API_KEY: string
  // Upstash Redis
  UPSTASH_REDIS_REST_URL: string
  UPSTASH_REDIS_REST_TOKEN: string
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
