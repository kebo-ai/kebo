# AGENTS.md - Kebo Codebase Guide

This document provides essential information for AI coding agents working in the Kebo codebase.

## Intent Layer

**Before modifying code in a subdirectory, read its AGENTS.md first** to understand local patterns and invariants.

- **API**: `apps/api/AGENTS.md` — Hono REST API with Drizzle ORM, deployed to Vercel
- **Dashboard**: `apps/dashboard/AGENTS.md` — Next.js financial dashboard with TanStack Query + Supabase realtime
- **Marketing**: `apps/marketing/AGENTS.md` — Next.js marketing site with i18n (es/en/pt)
- **Mobile**: `apps/mobile/AGENTS.md` — Expo/React Native app with React Query + Hono RPC
- **Shared**: `packages/shared/AGENTS.md` — Shared TypeScript types and constants

### Global Invariants

- All apps share Supabase as the backend (auth + database)
- Shared types live in `@kebo/shared` — never duplicate type definitions across apps
- Biome for linting/formatting everywhere — never use ESLint or Prettier
- Environment variables: `NEXT_PUBLIC_` (web), `EXPO_PUBLIC_` (mobile), plain (API)

## Project Overview

Kebo is a personal finance app with a mobile app, web dashboard, API, and marketing website. It's a **Turborepo monorepo** using **Bun** as the package manager.

| App | Path | Framework | Description |
|-----|------|-----------|-------------|
| API | `apps/api` | Hono + Drizzle ORM | REST API (Vercel serverless) |
| Dashboard | `apps/dashboard` | Next.js 16 + React 19 | Authenticated financial dashboard |
| Marketing | `apps/marketing` | Next.js 16 + React 19 | Public marketing/landing website |
| Mobile | `apps/mobile` | Expo SDK 54 + React Native | Main mobile application (React Query + Hono RPC) |
| Shared | `packages/shared` | TypeScript | Shared types and constants |

## Build/Lint/Test Commands

### Root Commands (run from monorepo root)

```bash
bun run dev          # Start all dev servers
bun run build        # Build all packages
bun run lint         # Check code with Biome
bun run lint:fix     # Auto-fix linting issues
bun run format       # Format code with Biome
bun run typecheck    # TypeScript type checking across all packages
bun run clean        # Clean build artifacts and node_modules
```

### App-Specific Commands

```bash
# Dashboard app
bun run dashboard dev          # Start Next.js dev server (port 3000)
bun run dashboard dev:turbo    # Start with Turbopack (faster)
bun run dashboard build        # Production build
bun run dashboard typecheck    # Type check dashboard app only

# Marketing app
bun run marketing dev          # Start Next.js dev server (port 3001)
bun run marketing dev:turbo    # Start with Turbopack (faster)
bun run marketing build        # Production build
bun run marketing typecheck    # Type check marketing app only

# Mobile app
bun run mobile start     # Start Expo dev server (clears cache)
bun run mobile ios       # Run on iOS simulator
bun run mobile android   # Run on Android emulator
bun run mobile typecheck # Type check mobile app only
```

### Testing

No test framework is currently configured. When tests are added, update this section.

### Local Supabase Commands

```bash
bun run supabase:start   # Start local Supabase (Docker required)
bun run supabase:stop    # Stop local Supabase
bun run supabase:status  # Show status and local URLs/keys
bun run supabase:reset   # Reset database and apply migrations + seed
bun run supabase:diff    # Generate migration from schema changes
bun run supabase:push    # Push migrations to remote database
```

## Code Style Guidelines

### Formatter: Biome

This project uses **Biome** (not ESLint/Prettier) for linting and formatting.

```bash
bun run lint         # Check for issues
bun run lint:fix     # Auto-fix issues
bun run format       # Format all files
```

### Formatting Rules

- **Indentation**: 2 spaces (not tabs)
- **Quotes**: Double quotes (`"`)
- **Semicolons**: Only when needed (ASI)
- **Imports**: Auto-organized by Biome

### TypeScript

- **Strict mode** is enabled across all packages
- Path aliases available:
  - `@/*` maps to `./src/*` (within each app)
  - `@kebo/shared` for shared package imports (dashboard only)
- Allowed (linter rules disabled):
  - Non-null assertions (`!`)
  - Explicit `any` types

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files (components) | PascalCase | `HomeScreen.tsx`, `CustomButton.tsx` |
| Files (utilities) | camelCase | `logger.ts`, `supabase.ts` |
| Components | PascalCase | `Hero`, `TransactionItem` |
| Functions/Variables | camelCase | `fetchTransactions`, `userBalance` |
| Hooks | `use` prefix | `useAnalytics`, `useStores` |
| Types/Interfaces | PascalCase | `Transaction`, `UserProfile` |
| Constants | UPPER_SNAKE_CASE or PascalCase | `API_URL`, `TransactionType` |
| MobX Models | `*Model` suffix | `CategoryStoreModel`, `ProfileModel` |
| Services | `*Service` suffix (class) | `TransactionService`, `AuthService` |
| Screens | `*Screen` suffix | `HomeScreen`, `SettingsScreen` |

### Import Order

Biome auto-organizes imports. Follow this order:
1. External libraries (`react`, `mobx-react-lite`)
2. Internal absolute imports (`@/components`, `@kebo/shared`)
3. Relative imports (`./AppShowcase`, `../utils`)
4. Type imports (can be inline or grouped at end)

### Error Handling

Use try-catch with the centralized logger:

```typescript
import { logger } from "@/utils/logger"

static async fetchData() {
  try {
    const { data, error } = await supabase.from("table").select()
    if (error) throw error
    return data
  } catch (error) {
    logger.error("Failed to fetch data:", error)
    throw error
  }
}
```

## Architecture Patterns

### Dashboard App (Next.js)

- **App Router** with internationalization (`/[lang]/app/...`)
- **Supported languages**: `es`, `en`, `pt`
- **UI Components**: shadcn/ui pattern with Radix primitives
- **Styling**: Tailwind CSS with `cn()` utility for class merging
- **State**: React Query for server state
- **Auth**: Supabase Auth with SSR middleware
- **Client components**: Use `"use client"` directive

### Marketing App (Next.js)

- **App Router** with internationalization (`/[lang]/...`)
- **Supported languages**: `es`, `en`, `pt`
- **i18n**: JSON dictionaries for translations
- **UI Components**: Minimal shadcn/ui (button, sheet)
- **Styling**: Tailwind CSS with Framer Motion animations
- **No auth** — public pages only

### Mobile App (React Native/Expo)

- **Server State**: TanStack Query v5 + Hono RPC typed client (same pattern as Dashboard)
- **UI State**: MobX-State-Tree (form state, UI selections — NOT server data)
- **Navigation**: expo-router (file-based) with native tabs and sheets
- **Styling**: twrnc (Tailwind for React Native)
- **i18n**: i18next with `translate()` function

```typescript
// Screen component pattern — React Query hooks for data, observer for UI state
import { observer } from "mobx-react-lite"
import { useTransactions, useDeleteTransaction } from "@/lib/api/hooks"
import { useQueryClient } from "@tanstack/react-query"

export const HomeScreen = observer(() => {
  const { data: txResponse } = useRecentTransactions(5)
  const { data: balance } = useBalance()
  const deleteTransaction = useDeleteTransaction()
  // ...
})
```

### API Layer (Mobile — `lib/api/`)

Same architecture as Dashboard — Hono RPC typed client with TanStack Query:

```
lib/api/
  rpc.ts              — Hono typed client singleton + unwrap<T>() helper
  client.ts           — Auth token management (getAccessToken, ApiError)
  types.ts            — TypeScript interfaces matching API response shapes
  keys.ts             — Query key factory (queryKeys.transactions.list(), etc.)
  query-config.ts     — Per-resource staleTime / gcTime
  hooks/              — useTransactions, useAccounts, useBudgets, etc.
  providers/          — QueryProvider (wraps app in QueryClientProvider)
lib/realtime/
  realtime-provider.tsx    — Supabase realtime subscriptions
  invalidation-tracker.ts  — markMutationSettled() deduplication
```
```

## Project Structure

```
kebo/
├── apps/
│   ├── dashboard/src/
│   │   ├── app/[lang]/app/   # Dashboard pages (auth + dashboard routes)
│   │   ├── components/
│   │   │   ├── app/          # Dashboard-specific components
│   │   │   └── ui/           # shadcn/ui components
│   │   └── lib/              # Utilities, auth, API hooks
│   │
│   ├── marketing/src/
│   │   ├── app/[lang]/       # Marketing pages (landing, blog, FAQs, legal)
│   │   ├── components/       # Marketing components (Header, Hero, etc.)
│   │   ├── i18n/             # Translations
│   │   └── lib/              # Utilities (cn, etc.)
│   │
│   └── mobile/
│       ├── app/              # expo-router file-based routes
│       ├── components/       # UI components
│       ├── screens/          # Screen components
│       ├── lib/api/          # React Query hooks + Hono RPC client
│       ├── lib/realtime/     # Supabase realtime sync
│       ├── models/           # MobX-State-Tree (UI state only)
│       ├── services/         # Legacy service classes (being phased out)
│       ├── hooks/            # Custom React hooks
│       ├── i18n/             # i18next translations
│       ├── theme/            # Colors, typography
│       └── utils/            # Utility functions
│
└── packages/shared/src/      # Shared types and constants
```

## Environment Variables

- **Dashboard**: Prefix with `NEXT_PUBLIC_` for client-side access. Also uses `NEXT_PUBLIC_MARKETING_URL` for cross-links.
- **Marketing**: Prefix with `NEXT_PUBLIC_` for client-side access. Uses `RESEND_API_KEY` for email.
- **Mobile**: Prefix with `EXPO_PUBLIC_` for client-side access
- Required: Supabase URL/key, PostHog key

## Key Dependencies

| Purpose | Dashboard | Marketing | Mobile |
|---------|-----------|-----------|--------|
| Backend | Supabase | Supabase (waitlist) | Supabase |
| Styling | Tailwind CSS | Tailwind CSS | twrnc |
| UI | Radix UI, shadcn/ui | Minimal shadcn/ui | Custom components |
| State | React Query | React state | React Query + MST (UI) |
| Analytics | Vercel Analytics | Vercel Analytics | PostHog |
| i18n | — | Custom dictionary | i18next |
| Animation | — | Framer Motion | — |
