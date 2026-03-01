# Mobile

Kebo personal finance app. Expo SDK 54 + React Native with TanStack Query and Hono RPC typed client.

## Purpose

Owns the mobile financial management experience: transactions, accounts, budgets, reports, AI chat.
Does NOT own: API business logic, web dashboard, marketing pages.

## Entry Points

- `app/_layout.tsx` — Root layout (fonts, providers, auth state)
- `app/(authenticated)/_layout.tsx` — Auth guard + RealtimeSyncProvider
- `app/(authenticated)/(tabs)/` — Bottom tab screens (Home, Transactions, Reports, Profile)

## Structure

```
apps/mobile/
  app/                          — expo-router file-based routes
    _layout.tsx                 — Root layout (QueryProvider, fonts, auth)
    (authenticated)/
      _layout.tsx               — Auth stack + RealtimeSyncProvider
      (tabs)/                   — Bottom tab navigator (NativeTabs)
      transaction.tsx           — Create transaction (modal)
      edit-transaction/         — Edit transaction (modal)
      category-picker.tsx       — Category selection (sheet)
      selection-sheet.tsx       — Generic selection sheet
      budget/[budgetId].tsx     — Budget detail
  components/
    ui/                         — Text, Button, Icon (design system)
    common/                     — Shared business components (cards, modals, charts)
    icons/                      — SVG icon components
    swipeable-list/             — Swipeable list component
  lib/
    api/
      rpc.ts                    — Hono typed client singleton + unwrap<T>()
      client.ts                 — Auth token management (getAccessToken, ApiError)
      types.ts                  — TypeScript interfaces matching API responses
      keys.ts                   — TanStack Query key factory
      query-config.ts           — Per-resource staleTime / gcTime
      hooks/                    — useTransactions, useAccounts, useBudgets, etc.
      providers/QueryProvider   — QueryClientProvider wrapper
    realtime/
      realtime-provider.tsx     — Supabase realtime subscriptions
      invalidation-tracker.ts   — markMutationSettled() deduplication
      use-realtime-sync.ts      — AppState focus manager + realtime hook
  models/                       — MobX-State-Tree (UI/form state ONLY)
  services/                     — Legacy service classes (being phased out)
  hooks/                        — Custom React hooks
  screens/                      — Screen components
  i18n/                         — i18next (8 languages: en, es, fr, pt, it, de, hi, zh)
  theme/                        — Colors, typography, header options
  utils/                        — Logger, storage, formatting
```

## Contracts & Invariants

- **Server data uses React Query hooks** — All data fetching uses `lib/api/hooks/`. Never call Supabase directly from screens. MST stores are for UI/form state only.
- **Query keys must use `keys.ts` factory** — All `useQuery` and `invalidateQueries` calls reference `queryKeys.*`. New hooks must add keys there.
- **Realtime deduplication required** — Any mutation that calls `invalidateQueries` in `onSettled` MUST also call `markMutationSettled(tableName)` first. Without it, the realtime subscription fires a duplicate invalidation.
- **Balance is a string from API** — All monetary fields come as strings. Must `parseFloat()` or `Number()` before arithmetic.
- **No `crypto.randomUUID()`** — Hermes engine doesn't support it. Use `tempId()` from `use-transactions.ts` for optimistic update IDs.
- **Dates must be ISO 8601 for API** — API Zod schemas validate `z.string().datetime()`. Use `moment().toISOString()` or `new Date().toISOString()`, never custom date formats.
- **Budget uses PUT for create** — `client.budgets.$put(data)`, matching the backend upsert pattern.
- **API base URL** — `EXPO_PUBLIC_API_URL` env var, defaults to `http://localhost:8787`.

## Data Fetching

- **TanStack Query v5** for all client-side data
- **Hono RPC typed client** — `hc<AppType>()` from `hono/client` with auto-auth header injection
- **Per-resource stale times**: transactions/balance 30s, accounts/budgets 2min, categories/reports 5min, banks 10min
- **Optimistic updates** on transaction mutations (create, update, delete, transfer) with snapshot/restore pattern
- **`unwrap<T>()`** helper handles response parsing and throws `ApiError` for non-ok responses

## Realtime Sync

`RealtimeSyncProvider` subscribes to Supabase `postgres_changes` for tables: `transactions`, `accounts`, `categories_users`, `budgets_users`, `budget_lines`. Invalidates TanStack Query caches when changes arrive from other sources.

`invalidation-tracker.ts` prevents double-fetch: `markMutationSettled(table)` creates a 2-second window that suppresses the realtime invalidation for own mutations.

`useMobileAppFocus()` triggers stale query refetches when the app returns from background.

## Patterns

### Screen with React Query

```typescript
import { observer } from "mobx-react-lite"
import { useBalance, useRecentTransactions, useDeleteTransaction } from "@/lib/api/hooks"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/api/keys"

export const HomeScreen = observer(function HomeScreen() {
  const { data: balance } = useBalance()
  const { data: txResponse } = useRecentTransactions(5)
  const deleteTransaction = useDeleteTransaction()
  const queryClient = useQueryClient()

  const handleRefresh = async () => {
    await Promise.all([
      queryClient.refetchQueries({ queryKey: queryKeys.balance.all }),
      queryClient.refetchQueries({ queryKey: queryKeys.transactions.all }),
    ])
  }

  const handleDelete = (id: string) => {
    deleteTransaction.mutate(id)  // optimistic update built into hook
  }
})
```

### Adding a new query hook

1. Add types to `lib/api/types.ts`
2. Add query key to `lib/api/keys.ts`
3. Add stale time to `lib/api/query-config.ts`
4. Create hook in `lib/api/hooks/use-*.ts`
5. Export from `lib/api/hooks/index.ts`
6. If using realtime, add subscription in `realtime-provider.tsx`

### MST — UI state only

MST stores remain for:
- Transaction form state (`transactionModel`) — 65+ fields, "last used" tracking
- UI selections (`uiStoreModel.sheetSelections`) — passing data between sheets
- Category/account form state pre-population

MST is NOT used for server data fetching. All server data comes through React Query hooks.

## Navigation

- **expo-router** file-based routing (NOT the old `navigators/` stack)
- **Tab bar**: `NativeTabs` from `expo-router/unstable-native-tabs` with SF Symbols
- **Native sheets**: `presentation: "formSheet"` with `sheetGrabberVisible` and `sheetAllowedDetents`
- **Modals**: `presentation: "card"` with `animation: "slide_from_bottom"` for transaction create/edit

## UI Component System

- `@/components/ui` exports: `Text`, `Button`, `Icon`
- `Text`: `type` (size preset), `weight` (maps to SFUIDisplay fonts), `color` prop
- `Button`: Uses `PressableScale` from pressto, variants: solid/outline/soft/link
- `Icon`: SF Symbol wrapper via expo-symbols (iOS only)
- Styling: **twrnc** (Tailwind for React Native)
- Brand color: `#6934D2` (defined in `theme/colors.ts`)

## Anti-patterns

- Never fetch server data with Supabase directly from screens — use React Query hooks
- Never skip `markMutationSettled()` in mutation `onSettled` callbacks
- Never hardcode query keys — always use the `queryKeys` factory
- Never use `crypto.randomUUID()` — Hermes doesn't support it
- Never send custom date formats to the API — always ISO 8601

## Environment Variables

```bash
EXPO_PUBLIC_API_URL=             # API base URL (default: http://localhost:8787)
EXPO_PUBLIC_SUPABASE_URL=        # Supabase project URL
EXPO_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anonymous key
EXPO_PUBLIC_POSTHOG_API_KEY=     # PostHog analytics
```

## Key Dependencies

| Purpose | Package |
|---------|---------|
| Server State | @tanstack/react-query |
| API Client | hono/client (typed RPC) |
| UI State | mobx-state-tree, mobx-react-lite |
| Navigation | expo-router |
| Backend | @supabase/supabase-js (auth + realtime only) |
| Styling | twrnc |
| Forms | formik |
| i18n | i18next, react-i18next |
| Analytics | posthog-react-native |
| Auth | expo-apple-authentication, @react-native-google-signin/google-signin |

## Related Context

- API endpoints: `apps/api/AGENTS.md`
- Dashboard (same API layer pattern): `apps/dashboard/AGENTS.md`
- Shared types: `packages/shared/AGENTS.md`
