# AGENTS.md - Kebo Shared Package

This document provides essential information for AI coding agents working in the Kebo shared package.

## Overview

The shared package contains **TypeScript types and constants** used across both the web and mobile apps. It has no runtime dependencies and exports TypeScript source directly.

| Attribute | Value |
|-----------|-------|
| Package Name | `@kebo/shared` |
| Language | TypeScript |
| Build | None (source exported directly) |
| Consumers | `apps/web`, `apps/mobile` |

## Commands

```bash
bun run shared typecheck   # Type check the package
```

## Directory Structure

```
packages/shared/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts           # Main entry point (re-exports all)
    ├── types/
    │   ├── index.ts       # Types barrel export
    │   ├── transaction.ts # Transaction-related types
    │   └── banner.ts      # Banner/UI types
    └── constants/
        └── index.ts       # App-wide constants
```

## Importing

The package supports multiple import paths:

```typescript
// Import everything
import { TransactionType, APP_NAME } from "@kebo/shared"

// Import types only
import { Budget, BudgetLine } from "@kebo/shared/types"

// Import constants only
import { APP_NAME, APP_VERSION } from "@kebo/shared/constants"
```

## Exported Types

### Transaction Types (`src/types/transaction.ts`)

**Enums:**

```typescript
enum TransactionType {
  EXPENSE = "Expense",
  INCOME = "Income",
  TRANSFER = "Transfer",
}

enum RecurrenceType {
  NEVER = "Never",
  DAILY = "Daily",
  WEEKLY = "Weekly",
  MONTHLY = "Monthly",
  YEARLY = "Yearly",
}

enum RecurrenceCadenceEnum {
  NEVER = "never",
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  YEARLY = "yearly",
}
```

**Mapping Objects:**

```typescript
// Maps enum values to i18n translation keys
const recurrenceDisplayMap: Record<RecurrenceType, string>
// e.g., RecurrenceType.DAILY -> "transactionScreen:daily"

// Reverse mapping from i18n keys to enum values
const recurrenceDisplayValueMap: Record<string, RecurrenceType>
```

**Interfaces:**

| Interface | Purpose |
|-----------|---------|
| `TransactionFormValues` | Form state for transaction creation/editing |
| `Budget` | Budget entity from database |
| `BudgetLine` | Individual budget line item with spending metrics |
| `TotalMetrics` | Aggregated budget metrics |
| `BudgetResponse` | API response structure for budget data |

### Banner Types (`src/types/banner.ts`)

| Interface | Purpose |
|-----------|---------|
| `Asset` | Media asset reference (url, type) |
| `CTA` | Call-to-action button (link, text) |
| `BannerSlide` | Single slide in a banner carousel |
| `Banner` | Full banner configuration |
| `DynamicBanner` | Banner with unique identifier |
| `BannerContent` | Specialized banner content (new version announcements) |

## Exported Constants

```typescript
export const APP_NAME = "Kebo"
export const APP_VERSION = "1.0.0"
```

## Adding New Types

1. Create or edit the appropriate file in `src/types/`
2. Export from `src/types/index.ts`
3. Types are automatically available via `@kebo/shared`

**Example:**

```typescript
// src/types/account.ts
export interface Account {
  id: string
  name: string
  balance: number
  currency: string
}

// src/types/index.ts
export * from "./transaction"
export * from "./banner"
export * from "./account"  // Add this line
```

## Adding New Constants

1. Add to `src/constants/index.ts`
2. Constants are automatically available via `@kebo/shared`

```typescript
// src/constants/index.ts
export const APP_NAME = "Kebo"
export const APP_VERSION = "1.0.0"
export const NEW_CONSTANT = "value"  // Add here
```

## Conventions

### Enum Naming

- Keys: `UPPER_SNAKE_CASE`
- Values: `PascalCase` (human-readable strings)

```typescript
enum TransactionType {
  EXPENSE = "Expense",      // Key: EXPENSE, Value: "Expense"
  INCOME = "Income",
  TRANSFER = "Transfer",
}
```

### i18n Integration

Use `namespace:key` format for translation keys:

```typescript
const recurrenceDisplayMap = {
  [RecurrenceType.NEVER]: "transactionScreen:never",
  [RecurrenceType.DAILY]: "transactionScreen:daily",
  // ...
}
```

### Database-Aligned Types

Include database metadata fields when mirroring Supabase tables:

```typescript
interface Budget {
  id: string
  user_id: string
  // ... business fields
  created_at: string
  updated_at: string
  deleted_at: string | null
  is_deleted: boolean
}
```

### Optional Fields

Use TypeScript optional syntax for nullable/optional fields:

```typescript
interface TransactionFormValues {
  account: string
  from_account?: string      // Optional for transfers
  to_account?: string        // Optional for transfers
  category?: string          // Optional
}
```

## Configuration

### package.json

```json
{
  "name": "@kebo/shared",
  "private": true,
  "main": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./types": "./src/types/index.ts",
    "./constants": "./src/constants/index.ts"
  }
}
```

### tsconfig.json

- Extends root `tsconfig.json`
- Strict mode enabled
- No build step (source exported directly)
