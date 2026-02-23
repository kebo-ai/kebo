"use client"

import { usePathname, useRouter } from "next/navigation"
import { Locale, i18n } from "@/i18n/config"
import { cn } from "@/lib/utils"

interface LanguageSwitcherProps {
  currentLang: Locale
}

const languageNames: Record<Locale, string> = {
  es: "ES",
  en: "EN",
  pt: "PT",
}

export default function LanguageSwitcher({ currentLang }: LanguageSwitcherProps) {
  const pathname = usePathname()
  const router = useRouter()

  const redirectedPathname = (locale: Locale) => {
    if (!pathname) return `/${locale}`
    const segments = pathname.split("/")
    segments[1] = locale
    return segments.join("/")
  }

  const handleLanguageChange = (locale: Locale) => {
    if (locale !== currentLang) {
      router.push(redirectedPathname(locale))
    }
  }

  return (
    <div className="flex items-center gap-0.5 text-sm">
      {i18n.locales.map((locale, index) => (
        <span key={locale} className="flex items-center">
          <button
            type="button"
            onClick={() => handleLanguageChange(locale)}
            className={cn(
              "px-1.5 py-0.5 transition-colors",
              currentLang === locale
                ? "font-medium text-foreground"
                : "text-muted-foreground/60 hover:text-muted-foreground"
            )}
            aria-label={`Switch to ${locale}`}
          >
            {languageNames[locale]}
          </button>
          {index < i18n.locales.length - 1 && (
            <span className="text-border">/</span>
          )}
        </span>
      ))}
    </div>
  )
}
