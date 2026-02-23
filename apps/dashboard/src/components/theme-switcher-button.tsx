"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { useCallback, useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface ThemeSwitcherToggleProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function ThemeSwitcherToggle({
  className,
  ...props
}: ThemeSwitcherToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleToggle = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      const x = event.clientX
      const y = event.clientY
      const newTheme = theme === "light" ? "dark" : "light"

      if (
        !document.startViewTransition ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        setTheme(newTheme)
        return
      }

      const transition = document.startViewTransition(() => {
        setTheme(newTheme)
      })

      try {
        await transition.ready

        const maxRadius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y)
        )

        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${maxRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 500,
            easing: "ease-out",
            pseudoElement: "::view-transition-new(root)",
          }
        )
      } catch {
        // View transition failed, theme still changed
      }
    },
    [theme, setTheme]
  )

  if (!mounted) {
    return (
      <div className={cn("flex items-center", className)} {...props}>
        <div className="w-11 h-6 bg-input rounded-full animate-pulse" />
      </div>
    )
  }

  const isDark = theme === "dark"

  return (
    <div className={cn("flex items-center", className)} {...props}>
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
          isDark ? "bg-foreground/20" : "bg-muted"
        )}
      >
        <span className="sr-only">Toggle theme</span>
        <span
          className={cn(
            "inline-flex h-4 w-4 items-center justify-center rounded-full bg-background transition duration-200 ease-in-out",
            isDark ? "translate-x-6" : "translate-x-1"
          )}
        >
          {isDark ? (
            <MoonIcon className="h-3 w-3 text-foreground" />
          ) : (
            <SunIcon className="h-3 w-3 text-foreground" />
          )}
        </span>
      </button>
    </div>
  )
}
