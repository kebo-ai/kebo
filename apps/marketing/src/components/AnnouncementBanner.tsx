"use client"

import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import type { Locale } from "@/i18n/config"

interface AnnouncementBannerProps {
  lang: Locale
}

export default function AnnouncementBanner({ lang }: AnnouncementBannerProps) {
  return (
    <div className="container mx-auto max-w-6xl px-4 pt-6 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Link
          href={`/${lang}/blog/open-source`}
          className="group relative mx-auto flex w-fit items-center gap-2 overflow-hidden rounded-full border border-kebo-500/30 bg-kebo-500/10 px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-kebo-500/50 hover:bg-kebo-500/20"
        >
          {/* Animated gradient background */}
          <span className="absolute inset-0 -z-10 bg-gradient-to-r from-kebo-500/0 via-kebo-500/10 to-kebo-500/0 opacity-0 transition-opacity group-hover:opacity-100" />

          {/* Sparkle icon */}
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-kebo-500/20">
            <Sparkles className="h-3 w-3 text-kebo-500" />
          </span>

          {/* Text */}
          <span className="text-kebo-600 dark:text-kebo-400">
            We&apos;re now open source!
          </span>

          {/* Separator */}
          <span className="h-4 w-px bg-border" />

          {/* CTA */}
          <span className="flex items-center gap-1 text-muted-foreground transition-colors group-hover:text-foreground">
            Read the announcement
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </motion.div>
    </div>
  )
}
