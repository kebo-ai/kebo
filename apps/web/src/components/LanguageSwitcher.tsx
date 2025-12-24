'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Locale, i18n } from '@/i18n/config'

interface LanguageSwitcherProps {
  currentLang: Locale
}

export default function LanguageSwitcher({ currentLang }: LanguageSwitcherProps) {
  const pathname = usePathname()
  
  const redirectedPathname = (locale: Locale) => {
    if (!pathname) return `/${locale}`
    const segments = pathname.split('/')
    segments[1] = locale
    return segments.join('/')
  }

  const languageNames: Record<Locale, string> = {
    es: 'ES',
    en: 'EN',
    pt: 'PT'
  }

  return (
    <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
      {i18n.locales.map((locale) => {
        const isActive = currentLang === locale
        return (
          <Link
            key={locale}
            href={redirectedPathname(locale)}
            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
              isActive
                ? 'bg-gray-800 text-white'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            {languageNames[locale]}
          </Link>
        )
      })}
    </div>
  )
}

