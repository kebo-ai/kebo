import { ArrowLeft, Calendar, Clock, Github, Globe, Users } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import Footer from "@/components/Footer"
import Header from "@/components/Header"
import { GithubLogo } from "@/components/logos/github"
import type { Locale } from "@/i18n/config"
import { getDictionary } from "@/i18n/get-dictionary"

export const metadata: Metadata = {
  title: "Kebo is now open source | Kebo Blog",
  description:
    "Today we're taking a step that's been on our minds for a while: We're open sourcing Kebo. Not because it's trendy, but because the best products are built in public.",
  openGraph: {
    title: "Kebo is now open source",
    description:
      "Today we're taking a step that's been on our minds for a while: We're open sourcing Kebo.",
    type: "article",
    publishedTime: "2024-12-24",
  },
}

// ============================================
// PUT YOUR MARKDOWN CONTENT HERE
// ============================================
const markdownContent = `
Over the last few months, Kebo has been getting organic traction, and we recently reached **50,000 users**. That still feels a little unreal.

Today we're taking a step that's been on our minds for a while:

> We're open sourcing Kebo.

Not because it's trendy, and not because we think we have everything figured out. We're doing it because we've learned that **the best products are built in public** — when people can see the work, question it, improve it, and make it better than we could on our own.

---

## What pushed us to do this

A few months ago we started collaborating with [Crafter Station](https://crafterstation.com) around product engineering and open source contributions — and we're still collaborating today. It's left us with a simple takeaway: **building with others makes you sharper and more honest**. You ship better, you learn faster, and you stop pretending you're perfect. So we want to keep building that way.

## What we believe

**We believe in latam/acc** — the acceleration of the Latin American tech ecosystem.

For us that means helping more builders and enterprises move faster, adopt good software practices, and feel confident building ambitious things.

And we think one of the best ways to accelerate is pretty simple: **lead by example**.

We've been inspired by people and projects that build openly — especially **Pontus Abrahamsson**, **Railly Hugo**, and **Anthony Cueva**. This is our way of giving that energy back, so other teams in the region can learn from what we do (and also tell us when we're wrong).

---

## Our commitment (simple and practical)

Here's what "open source Kebo" means to us:

- **Build in public (as much as we can)** — We'll share progress, decisions, and tradeoffs — not just polished launches.
- **Make it easy to contribute** — Clear docs, issues that are actually actionable, and a friendly contribution flow.
- **Keep it respectful and safe** — We'll have a code of conduct and we'll take security seriously.
- **Stay curious** — We're doing this to learn. If the community teaches us a better way, we'll take it.
- **Have fun while we do it** — Finance can feel heavy. Building doesn't have to. We want Kebo (and the process of building it) to stay human.

---

## A quick honest note about where Kebo is today

Kebo is a personal finance assistant: track spending, set budgets, and get savings insights.

But we're not going to pretend everything is solved.

- **Automations are still limited** today.
- **Accounts aren't automatically connected** yet, mainly because open finance in the region is hard and inconsistent.

That's also why open sourcing matters to us: we want to learn with others, and build the right approach for LATAM — not just copy what works elsewhere.

---

## 2026: make finances easier (and a bit more fun)

Our target for 2026 is straightforward:

**Find the best way to make personal finances easier — and even fun — without losing trust.**

Better automations, smoother flows, and insights that feel helpful (not stressful).

---

## If you want to be part of it

If you've ever wanted to shape a product you use, this is an open invite:

- Try it, break it, report it
- Suggest features (especially LATAM-specific ones)
- Contribute code, docs, design, translations, or feedback
- Tell us what would genuinely make managing money easier for you

**Repo:** [github.com/kebo-ai/kebo](https://github.com/kebo-ai/kebo)

**Web:** [kebo.finance](https://kebo.app)

---

Thanks for being part of the first 50k. **Now we build the next chapter together.**

---

## One more thing

None of this happens without the people behind it. Huge thanks to the **Kebo team**: Maria Cristina Ruelas, Alejandra Morales, Víctor Galvez, Pablo Japón, Axel Yaguana Cruz — the work, the patience, and the care you put into this every day.

And a special thanks to everyone who's supported us along the way — Crafter Station, Tomas Calle Moraleja, Anthony Cueva, Railly Hugo, Shiara Arauzo, Ignacio Rueda, Edward Junior Ramos Villarreal, Lizeth Karina Riveros Terrazo.
`

export default async function OpenSourceBlogPage({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return (
    <div className="flex min-h-screen flex-col">
      <Header lang={lang} dict={dict} />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border/50 bg-gradient-to-b from-kebo-50/50 via-background to-background dark:from-kebo-900/20">
          <div className="absolute inset-0 bg-grid-pattern-subtle mask-fade-bottom opacity-40" />

          <div className="container relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
            {/* Back link */}
            <Link
              href={`/${lang}`}
              className="group mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to home
            </Link>

            {/* Meta info */}
            <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <time dateTime="2024-12-24">December 24, 2025</time>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>5 min read</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>50,000+ users</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-r from-foreground via-foreground to-kebo-600 bg-clip-text text-transparent dark:to-kebo-400">
                Kebo is now open source
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-muted-foreground sm:text-2xl">
              Building the future of personal finance in public, together with
              the LATAM community.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="https://github.com/kebo-ai/kebo"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-all hover:scale-105 hover:bg-foreground/90"
              >
                <GithubLogo className="h-4 w-4" />
                View on GitHub
              </a>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <article className="container mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="prose-kebo">
            <Markdown remarkPlugins={[remarkGfm]}>{markdownContent}</Markdown>
          </div>
        </article>
      </main>
      <Footer lang={lang} dict={dict} />
    </div>
  )
}
