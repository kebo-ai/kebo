"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { AppleIcon, GooglePlayIcon } from "@/components/icons/StoreIcons"
import { Button } from "@/components/ui/button"
import AppShowcase from "./AppShowcase"

interface HeroProps {
  dict: {
    home: {
      badge: string
      hero: {
        title: string
        description: string
        appStore: string
        googlePlay: string
      }
      screenshots: {
        alt1: string
        alt2: string
        alt3: string
        alt4: string
        alt5: string
      }
    }
  }
  screenshots: Array<{ src: string; alt: string }>
}

export default function Hero({ dict, screenshots }: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Dotted grid background with fade */}
      <div className="absolute inset-0 bg-grid-pattern mask-fade-bottom" />
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />

      <div className="container relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-20 sm:px-6 sm:pb-24 sm:pt-28">
        <div className="flex flex-col items-center gap-16 lg:flex-row lg:items-start lg:justify-between">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-xl text-center lg:text-left"
          >
            {/* Wordmark */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-6"
            >
              <Image
                src="/images/logos/header-logo.png"
                alt="Kebo"
                width={120}
                height={40}
                className="mx-auto h-8 w-auto lg:mx-0"
                priority
              />
            </motion.div>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mb-6"
            >
              <div className="stellar-border inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium">
                <div className="stellar-border-inner" />
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-kebo-500 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-kebo-500" />
                </span>
                <span className="relative">{dict.home.badge}</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
              dangerouslySetInnerHTML={{ __html: dict.home.hero.title }}
            />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-10 text-lg leading-relaxed text-muted-foreground sm:text-xl"
            >
              {dict.home.hero.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start"
            >
              <Button size="lg" className="h-12 gap-2.5 px-6 text-base" asChild>
                <a
                  href="https://apps.apple.com/app/kebo-tu-asistente-financiero/id6742430536"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <AppleIcon className="h-5 w-5" />
                  {dict.home.hero.appStore}
                </a>
              </Button>
              <Button size="lg" variant="outline" className="h-12 gap-2.5 px-6 text-base" asChild>
                <a
                  href="https://play.google.com/store/apps/details?id=com.kebo.app.mobile&hl"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GooglePlayIcon className="h-5 w-5" />
                  {dict.home.hero.googlePlay}
                </a>
              </Button>
            </motion.div>
          </motion.div>

          {/* App Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full max-w-sm lg:max-w-[380px]"
          >
            <AppShowcase images={screenshots} />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
