# AGENTS.md - Kebo Codebase Guide

This document provides essential information for AI coding agents working in the Kebo codebase.

## Project Overview

Kebo is a personal finance mobile app with a marketing website. It's a **Turborepo monorepo** using **Bun** as the package manager.

| App | Path | Framework | Description |
|-----|------|-----------|-------------|
| Web | `apps/web` | Next.js 16 + React 19 | Marketing/landing website |
| Mobile | `apps/mobile` | Expo SDK 52 + React Native | Main mobile application |
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
# Web app
bun run web dev          # Start Next.js dev server
bun run web dev:turbo    # Start with Turbopack (faster)
bun run web build        # Production build
bun run web typecheck    # Type check web app only

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
  - `@kebo/shared` for shared package imports
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

### Web App (Next.js)

- **App Router** with internationalization (`/[lang]/...`)
- **Supported languages**: `es`, `en`, `pt`
- **UI Components**: shadcn/ui pattern with Radix primitives
- **Styling**: Tailwind CSS with `cn()` utility for class merging
- **Client components**: Use `"use client"` directive

```typescript
// Component pattern
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline"
}

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  return <button className={cn(baseStyles, variantStyles[variant], className)} {...props} />
}
```

### Mobile App (React Native/Expo)

- **State Management**: MobX-State-Tree
- **Navigation**: React Navigation (native stack + bottom tabs)
- **Styling**: twrnc (Tailwind for React Native)
- **i18n**: i18next with `translate()` function

```typescript
// Screen component pattern
import { observer } from "mobx-react-lite"
import { useStores } from "@/models"

export const HomeScreen = observer(() => {
  const { transactionStore } = useStores()
  // ...
})
```

### Services Pattern (Mobile)

```typescript
// Static methods, Supabase client, centralized error handling
export class TransactionService {
  static async getAll(userId: string) {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
      if (error) throw error
      return data
    } catch (error) {
      logger.error("TransactionService.getAll error:", error)
      throw error
    }
  }
}
```

## Project Structure

```
kebo/
├── apps/
│   ├── web/src/
│   │   ├── app/[lang]/     # Next.js pages (i18n routes)
│   │   ├── components/     # React components
│   │   │   └── ui/         # shadcn/ui components
│   │   ├── i18n/           # Translations
│   │   └── lib/            # Utilities (cn, etc.)
│   │
│   └── mobile/src/
│       ├── components/     # UI components
│       ├── screens/        # Screen components
│       ├── navigators/     # React Navigation config
│       ├── models/         # MobX-State-Tree stores
│       ├── services/       # API service classes
│       ├── hooks/          # Custom React hooks
│       ├── i18n/           # i18next translations
│       ├── theme/          # Colors, typography
│       └── utils/          # Utility functions
│
└── packages/shared/src/    # Shared types and constants
```

## Environment Variables

- **Web**: Prefix with `NEXT_PUBLIC_` for client-side access
- **Mobile**: Prefix with `EXPO_PUBLIC_` for client-side access
- Required: Supabase URL/key, PostHog key

## Key Dependencies

| Purpose | Web | Mobile |
|---------|-----|--------|
| Backend | Supabase | Supabase |
| Styling | Tailwind CSS | twrnc |
| UI | Radix UI, shadcn/ui | Custom components |
| State | React state | MobX-State-Tree |
| Analytics | Vercel Analytics | PostHog |
| i18n | Custom dictionary | i18next |
