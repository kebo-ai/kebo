"use client"

import { motion } from "framer-motion"
import { AppStoreBadge, GooglePlayBadge } from "@/components/icons/StoreBadges"
import { KeboWordmark } from "@/components/logos/kebo-wordmark"
import AppShowcase from "./AppShowcase"

interface HeroProps {
  dict: {
    home: {
      badge: string
      hero: {
        title: string
        description: string
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
}

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
      mass: 0.8,
    },
  },
}

export default function Hero({ dict, screenshots }: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="container relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-20 sm:px-6 sm:pb-24 sm:pt-28">
        <div className="flex flex-col items-center gap-16 lg:flex-row lg:items-start lg:justify-between">
          {/* Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-xl text-center lg:text-left"
          >
            {/* Wordmark */}
            <motion.div variants={itemVariants} className="mb-6">
              <KeboWordmark className="mx-auto h-10 w-auto lg:mx-0" />
            </motion.div>

            {/* Badge */}
            <motion.div variants={badgeVariants} className="mb-6">
              <motion.div
                className="stellar-border inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <div className="stellar-border-inner" />
                <motion.span
                  className="relative flex h-2 w-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.5,
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                  }}
                >
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-kebo-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-kebo-500" />
                </motion.span>
                <span className="relative">{dict.home.badge}</span>
              </motion.div>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="mb-6 text-4xl font-bold tracking-tight text-foreground text-balance sm:text-5xl lg:text-6xl"
              dangerouslySetInnerHTML={{ __html: dict.home.hero.title }}
            />

            <motion.p
              variants={itemVariants}
              className="mb-10 text-lg leading-relaxed text-muted-foreground sm:text-xl"
            >
              {dict.home.hero.description}
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center gap-3 sm:flex-row lg:items-start"
            >
              <AppStoreBadge />
              <GooglePlayBadge />
            </motion.div>
          </motion.div>

          {/* App Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.6,
              delay: 0.4,
              type: "spring",
              stiffness: 80,
              damping: 15,
            }}
            className="w-full max-w-sm lg:max-w-[380px]"
          >
            <AppShowcase images={screenshots} />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
