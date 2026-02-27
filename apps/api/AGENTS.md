# API

REST API for Kebo. Hono framework with Drizzle ORM, deployed to Vercel serverless.

## Purpose

Owns all server-side business logic, database access, and AI features (Kebo Wise chat, report generation).
Does NOT own: client-side state, UI, or auth UI flows (those live in dashboard/mobile).

## Entry Points

- `src/app.ts` — `createApp()` factory: middleware stack + route registration
- `src/index.ts` — Vercel export
- `src/dev.ts` — Local dev server (port 8787, reads `.dev.vars`)
- `api/index.js` — **Vercel serverless function entry point.** Custom handler that buffers `req.body` before creating Web Request. Do NOT replace with `@hono/node-server`'s `getRequestListener` — it has a body stream bug that causes POST requests to hang on Vercel.

## Structure

```
src/
  db/schema/        — Drizzle table definitions + relations
  middleware/        — auth, rate-limit, error-handler, logger, body-limit
  routes/            — One file per resource (transactions, accounts, etc.)
  services/          — Business logic (ai, budget, report, transaction, etc.)
  utils/             — Pagination, response schemas
  types/env.ts       — AppEnv type (Bindings + Variables)
```

## Contracts & Invariants

- **DB connection is per-request** — `max: 1` with aggressive timeouts, closed with `client.end({ timeout: 0 })` after `next()`. The `timeout: 0` is critical — any other value causes deadlocks on Vercel serverless.
- **`userId` always comes from verified JWT** — never trusted from request body/query. Set via `c.set("userId", payload.sub)`.
- **Static routes before `/:id`** — e.g., `/balance` and `/recurring` registered before `/:id` in transactions. Hono matches first-registered. Comments in code flag this.
- **Admin auth is separate** — uses `X-Admin-Key` header with timing-safe comparison, not JWT.
- **Amounts are strings** — stored as Postgres `numeric`, validated with 2-decimal regex. Consumers must `parseFloat()`.
- **Soft delete everywhere** — `is_deleted = true`, `deleted_at = now()`. Only user account deletion is hard delete.
- **Budgets use PUT for upsert** — `PUT /budgets/` creates or updates, no separate POST.

## Routes

All routes use `@hono/zod-openapi`. OpenAPI spec at `/openapi.json`, Scalar UI at `/docs`.

| Prefix | Auth | Key Endpoints |
|--------|------|---------------|
| `/health` | None | Health check |
| `/transactions` | JWT | CRUD, balance, recurring, transfers |
| `/accounts` | JWT | CRUD with computed balances |
| `/categories` | JWT | CRUD, filterable by type |
| `/budgets` | JWT | List, get, upsert (PUT), delete |
| `/banks` | JWT | List, search, by-country |
| `/reports` | JWT | Expense-by-category, income-vs-expense |
| `/users` | JWT | Profile CRUD, account deletion |
| `/reviews` | JWT | App rating eligibility + actions |
| `/reference` | Optional | Icons, account types, banners |
| `/ai` | JWT + AI rate limit | Chat (streaming SSE), reports, conversations |
| `/admin` | X-Admin-Key | Document ingestion, knowledge base management |

## Middleware Stack (order matters)

1. `secureHeaders()` — Hono built-in
2. `loggerMiddleware` — Structured JSON with request ID
3. `cors()` — `kebo.app`, `my.kebo.app`, `localhost:3000/8081`
4. `defaultBodyLimit` — 1MB (5MB for admin)
5. `rateLimitMiddleware` — Upstash Redis sliding window (60/min general, 10/min AI, 5/min admin). Skips gracefully if Redis config missing.
6. DB init — Per-request Postgres connection via `c.set("db")`
7. Per-router `authMiddleware` — Applied inside each route file, not globally

## Patterns

Adding a new route:
1. Create `src/routes/<resource>.routes.ts`
2. Define routes with `createRoute()` + Zod schemas
3. Register in `src/routes/index.ts` via `registerRoutes()`
4. Add service logic in `src/services/` if needed
5. Add Drizzle schema in `src/db/schema/` if new table

## Anti-patterns

- Never bypass `authMiddleware` for user-owned data routes
- Never query without filtering by `user_id` for user-owned tables
- Never put `/:id` routes before static path routes (e.g., `/balance`)
- Never hardcode DB credentials — always use `DATABASE_URL` from env
- Never use `getRequestListener` from `@hono/node-server` in `api/index.js` — it hangs on POST body reads on Vercel
- Never change `client.end({ timeout: 0 })` in db middleware — other timeout values deadlock on Vercel

## AI / RAG

- LLM: Claude Sonnet via AI SDK Gateway (`@ai-sdk/gateway`)
- Embeddings: `openai/text-embedding-3-small` for vectorization
- RAG: cosine similarity on `documentChunks` table (pgvector)
- Streaming: Hono `stream()` → SSE format (`conversation_id` → `text` chunks → `done`)
- System prompt is in Spanish (target audience)

## Related Context

- Database schema: `supabase/config.toml` + `src/db/schema/`
- Shared types: `packages/shared/AGENTS.md`
