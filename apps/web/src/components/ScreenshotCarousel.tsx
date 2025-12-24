'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

interface ScreenshotCarouselProps {
  images: {
    src: string
    alt: string
  }[]
}

export default function ScreenshotCarousel({ images }: ScreenshotCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  // Autoplay functionality
  useEffect(() => {
    if (!autoplay) return

    const interval = setInterval(() => {
      setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    }, 3000)

    return () => clearInterval(interval)
  }, [autoplay, images.length])

  // Pause autoplay when user interacts with controls
  const handleInteraction = () => {
    setAutoplay(false)
    // Resume autoplay after 5 seconds of inactivity
    setTimeout(() => setAutoplay(true), 5000)
  }

  return (
    <div className="relative overflow-hidden">
      {/* Main carousel */}
      <div className="w-full aspect-[270/584] relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 flex justify-center"
          >
            <div className="relative w-full max-w-[280px] mx-auto">
              <Image
                src={images[current].src}
                alt={images[current].alt}
                width={600}
                height={1200}
                className="w-full h-auto shadow-lg rounded-3xl"
                priority={current === 0}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Indicators */}
      <div className="flex justify-center mt-6 space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrent(index)
              handleInteraction()
            }}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              current === index ? 'bg-gray-800 w-6' : 'bg-gray-300'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation buttons */}
      <button
        onClick={() => {
          setCurrent(current === 0 ? images.length - 1 : current - 1)
          handleInteraction()
        }}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-colors"
        aria-label="Previous slide"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5 text-gray-800"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
      <button
        onClick={() => {
          setCurrent(current === images.length - 1 ? 0 : current + 1)
          handleInteraction()
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-colors"
        aria-label="Next slide"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5 text-gray-800"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  )
} 