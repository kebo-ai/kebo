import "server-only"
import { hc } from "hono/client"
import type { AppType } from "@kebo/api/app"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787"

export function createServerApiClient(token: string) {
  return hc<AppType>(API_BASE_URL, {
    headers: { Authorization: `Bearer ${token}` },
  })
}
