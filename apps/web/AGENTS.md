# AGENTS.md - Kebo Web App

This document provides essential information for AI coding agents working in the Kebo web application.

## Overview

The web app is a **Next.js 16 marketing/landing website** for the Kebo personal finance mobile app. Built with React 19, it serves as the public-facing website with internationalization support.

| Attribute | Value |
|-----------|-------|
| Framework | Next.js 16.1.1 + React 19 |
| Router | App Router |
| Styling | Tailwind CSS + shadcn/ui |
| i18n | Custom implementation (es, en, pt) |
| Backend | Supabase |
| Email | Resend |

## Commands

```bash
bun run web dev          # Start Next.js dev server
bun run web dev:turbo    # Start with Turbopack (faster)
bun run web build        # Production build
bun run web typecheck    # Type check this app only
```

## Directory Structure

```
apps/web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── globals.css         # Global styles + CSS variables
│   │   ├── fonts/              # Local Geist fonts
│   │   ├── api/                # API routes
│   │   │   ├── contact/        # Contact form endpoint
│   │   │   ├── data/           # Data endpoints
│   │   │   └── feedback/       # Feedback endpoint
│   │   └── [lang]/             # Internationalized routes
│   │       ├── layout.tsx      # Root layout
│   │       ├── page.tsx        # Home page
│   │       ├── blog/           # Blog pages
│   │       ├── cookies-policy/ # Legal pages
│   │       ├── privacy-policy/
│   │       ├── terms/
│   │       └── faqs/
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── elements/           # Custom UI elements
│   │   ├── icons/              # Store badges, icons
│   │   ├── logos/              # SVG logo components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   └── ...
│   ├── i18n/
│   │   ├── config.ts           # Locale configuration
│   │   ├── get-dictionary.ts   # Dictionary loader
│   │   └── dictionaries/       # Translation files (es.json, en.json, pt.json)
│   └── lib/
│       └── utils.ts            # cn() utility
├── public/                     # Static assets
│   ├── images/                 # Logos, screenshots
│   └── videos/                 # Preview videos
├── policies_terms/             # Legal content (txt files)
└── docs/                       # Documentation
```

## Key Patterns

### Internationalization (i18n)

Routes are prefixed with locale: `/[lang]/...`

```typescript
// i18n/config.ts
export const i18n = {
  defaultLocale: "es",
  locales: ["es", "en", "pt"],
} as const

export type Locale = (typeof i18n)["locales"][number]
```

**Usage in pages:**

```typescript
import { getDictionary } from "@/i18n/get-dictionary"

export default async function Page({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  
  return <div>{dict.home.hero.title}</div>
}
```

### Page Component Pattern

Pages are async Server Components by default:

```typescript
export default async function Page({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header lang={lang} dict={dict} />
      <main className="flex-1">{/* content */}</main>
      <Footer lang={lang} dict={dict} />
    </div>
  )
}
```

### Client Components

Use `"use client"` directive. Handle hydration with mounted state:

```typescript
"use client"

export function ThemeSwitcherButton() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  
  if (!mounted) return <Skeleton />
  // ... render actual content
}
```

### shadcn/ui Components

Located in `src/components/ui/`. Use `class-variance-authority` for variants:

```typescript
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center...",
  {
    variants: {
      variant: { default: "...", outline: "...", ghost: "..." },
      size: { default: "h-9 px-4", sm: "h-8 px-3", lg: "h-10 px-6" },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

export function Button({ className, variant, size, ...props }) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
}
```

### cn() Utility

Use for conditional class merging:

```typescript
import { cn } from "@/lib/utils"

<div className={cn("base-class", condition && "conditional-class", className)} />
```

### API Route Pattern

```typescript
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    if (!body.required) {
      return NextResponse.json({ error: "Missing field" }, { status: 400 })
    }
    
    // Process request...
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
```

## Styling

### Tailwind CSS + CSS Variables

Colors are defined as HSL values in `globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 262 66% 52%;  /* Kebo purple */
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
}
```

### Custom CSS Classes

| Class | Purpose |
|-------|---------|
| `.bg-grid-pattern` | Dotted grid background |
| `.bg-grid-pattern-subtle` | Subtle dotted grid |
| `.mask-fade-bottom` | Bottom gradient mask |
| `.mask-fade-edges` | Edge gradient mask |
| `.stellar-border` | Animated border effect |
| `.prose-kebo` | Blog/markdown styling |

### Theme Colors (tailwind.config.ts)

- `kebo-50` to `kebo-950`: Brand purple palette
- Semantic colors: `background`, `foreground`, `primary`, `secondary`, `muted`, `accent`, `destructive`

## File Naming

| Type | Convention | Example |
|------|------------|---------|
| Pages | `page.tsx` | `app/[lang]/page.tsx` |
| Layouts | `layout.tsx` | `app/[lang]/layout.tsx` |
| API Routes | `route.ts` | `app/api/contact/route.ts` |
| Components | PascalCase | `Header.tsx`, `Hero.tsx` |
| UI Components | lowercase | `button.tsx`, `card.tsx` |
| Logos | lowercase | `kebo.tsx`, `github.tsx` |
| Dictionaries | locale code | `es.json`, `en.json` |

## Configuration Files

| File | Purpose |
|------|---------|
| `next.config.ts` | Next.js config (transpilePackages, reactCompiler) |
| `tailwind.config.ts` | Tailwind theme, colors, fonts, animations |
| `components.json` | shadcn/ui configuration |
| `biome.json` | Extends root, ignores `.next`, `noUnknownAtRules: off` |
| `tsconfig.json` | Path aliases: `@/*` -> `./src/*` |

## Environment Variables

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Resend (for email)
RESEND_API_KEY=
```

## Adding New Pages

1. Create folder in `src/app/[lang]/`
2. Add `page.tsx` with async Server Component pattern
3. Add translations to all dictionary files (`es.json`, `en.json`, `pt.json`)
4. Include `Header` and `Footer` components

## Adding shadcn/ui Components

```bash
bunx shadcn@latest add [component-name]
```

Components are added to `src/components/ui/`.
