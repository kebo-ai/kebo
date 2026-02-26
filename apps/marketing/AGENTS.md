# Marketing

Public marketing website for Kebo. Next.js 16 App Router with i18n (3 locales) and Framer Motion.

## Purpose

Owns the public-facing website: landing page, FAQs, blog, legal pages, waitlist signup, and contact form.
Does NOT own: authenticated features, financial data, or API logic.

## Entry Points

- `src/app/[lang]/page.tsx` — Home page (Server Component, passes dictionary as props)
- `src/app/[lang]/layout.tsx` — Root layout with ThemeProvider + metadata
- `src/app/api/` — Route Handlers for contact, feedback, waitlist

## Structure

```
src/
  app/
    [lang]/             — All pages under locale prefix (es/en/pt)
      faqs/, blog/, privacy-policy/, cookies-policy/, terms/
    api/
      contact/          — POST: dual Resend email (team + user confirmation)
      data/             — POST: Supabase waitlist + Resend welcome email
      feedback/         — POST: Supabase app_feedback + Resend
  components/
    ui/                 — shadcn/ui (button, sheet only)
    logos/, icons/       — Brand logos, store badges (SVG)
    Hero, Header, Footer, Features, Stats, CTA, etc.
  i18n/
    config.ts           — Locale definitions
    get-dictionary.ts   — Server-only dynamic import loader
    dictionaries/       — en.json, es.json, pt.json
  lib/
    utils.ts            — cn() helper
```

## Contracts & Invariants

- **Dictionary-as-props pattern** — Server Components call `getDictionary(lang)`, pass result as props to Client Components. No global i18n store or context.
- **Default locale is `es`** — Root `/` redirects to `/es`. Unknown locales get a 404 (no middleware redirect).
- **Policy pages read `.txt` files at runtime** — `policies_terms/*.txt` via `fs.readFileSync`. If file missing, calls `notFound()`.
- **No middleware for locale routing** — locale handling is purely via `[lang]` dynamic segment + `next.config` redirects.
- **Each component types its own `dict` prop** — no shared dictionary TypeScript type. Adding a new key requires updating component interfaces manually.

## i18n

3 locales: `es` (default), `en`, `pt`. Dictionary files in `src/i18n/dictionaries/`.

`get-dictionary.ts` uses dynamic `import()` with `server-only` — dictionaries are not bundled together. Falls back to `es` for unknown locales.

`LanguageSwitcher.tsx` (client component) swaps the locale segment in pathname and calls `router.push()`.

## Patterns

Adding a new page:
1. Create `src/app/[lang]/<route>/page.tsx` as async Server Component
2. Call `getDictionary(params.lang)` for translations
3. Add translation keys to all 3 dictionary files
4. If interactive, extract Client Component with `"use client"` and pass `dict` as prop

Adding translations:
1. Add keys to `src/i18n/dictionaries/es.json`, `en.json`, `pt.json`
2. Type the dict prop in the consuming component's interface

## Anti-patterns

- Never use a global i18n context or `useTranslation()` hook — this app uses dictionary-as-props
- Never add pages outside the `[lang]/` segment — all user-facing routes must be localized
- Never bundle all dictionaries together — use the dynamic import pattern in `get-dictionary.ts`

## Styling

- Dark mode default, system detection disabled
- Tailwind CSS + Framer Motion for animations
- Brand color: `kebo` palette (`#6934D2`)
- Dot grid background texture via CSS `radial-gradient`
- `prose-kebo` class for blog content (custom, not `@tailwindcss/typography`)

## External Services

| Service | Usage |
|---------|-------|
| Resend | Contact form, waitlist, and feedback emails |
| Supabase | Stores `landing_waitlist` and `app_feedback` |
| Vercel Analytics | Root layout `<Analytics />` |

## Related Context

- API endpoints: `apps/api/AGENTS.md`
- Shared types: `packages/shared/AGENTS.md`
