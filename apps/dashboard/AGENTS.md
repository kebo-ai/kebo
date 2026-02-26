# Dashboard

Authenticated financial dashboard for Kebo. Next.js 16 App Router with TanStack Query and Supabase Auth.

## Purpose

Owns the web-based financial management experience: transactions, accounts, budgets, reports, AI chat.
Does NOT own: mobile experience, API business logic, marketing pages.

## Entry Points

- `src/app/(dashboard)/layout.tsx` — Auth guard (Server Component, redirects to `/login` if no session)
- `src/proxy.ts` — The actual Next.js middleware (session refresh, NOT the auth gate)
- `src/app/(auth)/` — Login + OAuth callback

## Structure

```
src/
  app/
    (auth)/             — Login page, OAuth callback
    (dashboard)/        — All protected routes (home, transactions, accounts, etc.)
    api/feedback/       — Next.js Route Handler (Supabase + Resend)
  components/
    ui/                 — shadcn/ui (Radix-based)
    *.tsx               — Business components (forms, cards, panels)
  lib/
    api/
      client.ts         — Browser fetch client (attaches Bearer token)
      server.ts         — Server-side fetch client (token as arg)
      keys.ts           — TanStack Query key factory (single source of truth)
      query-config.ts   — Per-resource staleTime / gcTime
      hooks/            — useTransactions, useAccounts, useBudgets, etc.
      providers/        — QueryProvider
    auth/
      client.ts         — Supabase browser client
      server.ts         — Supabase server client (cookies)
      hooks.ts          — useAuth() client hook
    realtime/           — Supabase realtime subscriptions + deduplication
    stores/             — Zustand (UI state only)
  proxy.ts              — Next.js middleware entry point
```

## Contracts & Invariants

- **Auth gate is the layout, not middleware** — `(dashboard)/layout.tsx` calls `supabase.auth.getUser()` and redirects. `proxy.ts` only refreshes the session cookie.
- **Query keys must use `keys.ts` factory** — All `useQuery` and `invalidateQueries` calls reference `queryKeys.*`. New hooks must add keys there.
- **Realtime deduplication required** — Any mutation that calls `invalidateQueries` in `onSettled` MUST also call `markMutationSettled(tableName)` first. Without it, the realtime subscription fires a duplicate invalidation within 2 seconds.
- **Balance is a string from API** — All monetary fields come as strings. Must `parseFloat()` before arithmetic or display.
- **Budget uses PUT for create** — `api.put("/budgets", data)`, matching the backend upsert pattern.
- **API base URL** — `NEXT_PUBLIC_API_URL` env var, defaults to `http://localhost:8787`.

## Data Fetching

- **TanStack Query v5** for all client-side data
- **SSR prefetch** only on the home page (`/`) — `QueryClient` + `HydrationBoundary`
- **Per-resource stale times**: transactions/balance 30s, accounts/budgets 2min, categories/reports 5min, banks 10min
- **Optimistic updates** on transaction mutations (create, update, delete, transfer) with snapshot/restore pattern

## Realtime Sync

`RealtimeSyncProvider` subscribes to Supabase `postgres_changes` for 5 tables: `transactions`, `accounts`, `categories_users`, `budgets_users`, `budget_lines`. Invalidates TanStack Query caches when changes arrive from other sources.

`invalidation-tracker.ts` prevents double-fetch: `markMutationSettled(table)` creates a 2-second window that suppresses the realtime invalidation for own mutations.

## Patterns

Adding a new page:
1. Create route in `src/app/(dashboard)/<route>/page.tsx`
2. Add TanStack Query hook in `src/lib/api/hooks/`
3. Add query key to `src/lib/api/keys.ts`
4. Add stale time config to `src/lib/api/query-config.ts`
5. If using realtime, add subscription in `realtime-provider.tsx`

Adding a form:
- Hand-rolled `useState` + `validate()` — no form library (no react-hook-form, no Zod client-side)
- Follow existing pattern in `transaction-form.tsx`, `account-form.tsx`

## Anti-patterns

- Never add middleware-level auth redirects — the layout is the auth gate
- Never skip `markMutationSettled()` in mutation `onSettled` callbacks
- Never hardcode query keys — always use the `queryKeys` factory
- Never use `useMemo`/`useCallback` unnecessarily — React Compiler is enabled

## Styling

- **Dark mode default** (`defaultTheme="dark"`, system detection disabled)
- shadcn/ui + Tailwind CSS with `cn()` utility
- Brand color: `kebo` palette (`#6934D2` primary)
- Fonts: Geist Sans + Geist Mono (variable)

## Key Config

- React Compiler enabled (`reactCompiler: true`)
- Turbopack with filesystem cache
- Vercel Analytics embedded in root layout
- No i18n — English only (unlike mobile/marketing)

## Related Context

- API endpoints: `apps/api/AGENTS.md`
- Shared types: `packages/shared/AGENTS.md`
