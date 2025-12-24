import Image from 'next/image'
import Link from 'next/link'
import LanguageSwitcher from './LanguageSwitcher'
import { Locale } from '@/i18n/config'

interface HeaderProps {
  lang: Locale
  dict: {
    header: {
      contact: string
    }
  }
}

export default function Header({ lang, dict }: HeaderProps) {
  return (
    <header className="bg-white py-4 shadow-sm">
      <div className="max-w-5xl mx-auto flex justify-between items-center px-6 sm:px-8">
        <Link href={`/${lang}`}>
          <Image
            src="/images/logos/header-logo.png"
            alt="Kebo Logo"
            width={180}
            height={60}
            className="w-auto h-8 sm:h-10 hover:opacity-90 transition-opacity"
          />
        </Link>
        <div className="flex items-center gap-4">
          <LanguageSwitcher currentLang={lang} />
          <a
            href={`/${lang}/contacto`}
            className="text-gray-800 hover:text-gray-600 transition-colors px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {dict.header.contact}
          </a>
        </div>
      </div>
    </header>
  )
} 