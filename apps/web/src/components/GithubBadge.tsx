"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export function GithubBadge() {
  const [stars, setStars] = useState<number | null>(null)
  const [shouldAnimate, setShouldAnimate] = useState(false)

  useEffect(() => {
    const fetchStars = async () => {
      try {
        const response = await fetch(
          "https://api.github.com/repos/kebo-ai/kebo",
        )
        if (response.ok) {
          const data = await response.json()
          setStars(data.stargazers_count)
          setTimeout(() => setShouldAnimate(true), 100)
        }
      } catch (error) {
        console.warn("Failed to fetch GitHub stars:", error)
      }
    }
    fetchStars()
  }, [])

  return (
    <>
        <style>{`
          @keyframes starGlow {
            0%, 100% {
              filter: drop-shadow(0 0 0.5px rgba(251, 191, 36, 0.2))
                      drop-shadow(0 0 1px rgba(251, 191, 36, 0.1))
                      brightness(1);
              transform: scale(1);
            }
            50% {
              filter: drop-shadow(0 0 1.5px rgba(251, 191, 36, 0.35))
                      drop-shadow(0 0 2px rgba(251, 191, 36, 0.18))
                      brightness(1.05);
              transform: scale(1.02);
            }
          }

          @keyframes gradientMove {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .github-badge:hover .star-icon {
            animation: starGlow 2.5s ease-in-out infinite;
          }

          .github-badge:hover .star-wrapper::before {
            content: '';
            position: absolute;
            inset: -1.5px;
            background: conic-gradient(
              from 0deg,
              transparent 0deg,
              transparent 120deg,
              rgba(251, 191, 36, 0.12) 150deg,
              rgba(251, 191, 36, 0.18) 180deg,
              rgba(251, 191, 36, 0.12) 210deg,
              transparent 240deg,
              transparent 360deg
            );
            border-radius: 50%;
            animation: gradientMove 2.5s linear infinite;
            pointer-events: none;
            z-index: -1;
            filter: blur(1px);
          }

          .github-badge:active {
            transform: scale(0.95);
            transition: transform 0.1s ease;
          }
        `}</style>

      <motion.a
        href="https://github.com/kebo-ai/kebo"
        target="_blank"
        rel="noopener noreferrer"
        className="github-badge flex h-[38px] items-center gap-2.5 rounded-full border border-border/60 bg-background px-4 text-sm shadow-sm shadow-black/5"
        initial={{ opacity: 0, x: -20 }}
        animate={{
          opacity: shouldAnimate ? 1 : 0,
          x: shouldAnimate ? 0 : -20,
        }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* GitHub Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="text-foreground"
        >
          <title>GitHub</title>
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>

        {/* Star count */}
        {stars !== null && (
          <motion.span
            className="flex items-center gap-1.5 font-medium text-foreground"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.2,
              type: "spring",
              stiffness: 120,
              damping: 15,
            }}
          >
            <div className="star-wrapper relative inline-block">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                className="star-icon relative"
                style={{
                  filter: "drop-shadow(0 0 0.5px rgba(251, 191, 36, 0.2))",
                }}
              >
                <title>Star</title>
                <defs>
                  <linearGradient
                    id="starGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="rgba(251, 191, 36, 0.8)" />
                    <stop offset="50%" stopColor="rgba(251, 191, 36, 1)" />
                    <stop offset="100%" stopColor="rgba(251, 191, 36, 0.8)" />
                  </linearGradient>
                </defs>
                <polygon
                  points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                  fill="url(#starGradient)"
                />
              </svg>
            </div>
            {stars}
          </motion.span>
        )}
      </motion.a>
    </>
  )
}
