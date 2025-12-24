"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface AppShowcaseProps {
  images: Array<{ src: string; alt: string }>
}

export default function AppShowcase({ images }: AppShowcaseProps) {
  const [current, setCurrent] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  const next = useCallback(() => {
    setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }, [images.length])

  useEffect(() => {
    if (!autoplay) return
    const interval = setInterval(next, 4000)
    return () => clearInterval(interval)
  }, [autoplay, next])

  const handleSelect = (index: number) => {
    setCurrent(index)
    setAutoplay(false)
    setTimeout(() => setAutoplay(true), 10000)
  }

  return (
    <div className="relative">
      {/* Main device display */}
      <div className="relative ml-auto w-[260px] sm:w-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="relative"
          >
            <Image
              src={images[current].src}
              alt={images[current].alt}
              width={300}
              height={650}
              className="h-auto w-full rounded-[2.5rem] drop-shadow-xl"
              priority={current === 0}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Minimal dot indicators */}
      <div className="ml-auto mt-8 flex w-[260px] justify-center gap-2 sm:w-[300px]">
        {images.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleSelect(index)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              current === index
                ? "w-6 bg-foreground"
                : "w-1.5 bg-foreground/20 hover:bg-foreground/40",
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
