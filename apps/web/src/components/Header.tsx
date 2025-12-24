"use client"

import Image from "next/image"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ThemeSwitcherButton } from "@/components/elements/theme-switcher-button"
import LanguageSwitcher from "./LanguageSwitcher"
import { Locale } from "@/i18n/config"

interface HeaderProps {
  lang: Locale
  dict: {
    header: {
      contact: string
    }
  }
}

export default function Header({ lang }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full px-4 pt-4 sm:px-6">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        {/* Logo */}
        <Link href={`/${lang}`} className="flex items-center">
          <Image
            src="/images/logos/kebo-icon.svg"
            alt="Kebo"
            width={40}
            height={40}
            className="h-9 w-9"
            priority
          />
        </Link>

        {/* Desktop Navigation Pill */}
        <nav className="hidden items-center gap-3 rounded-full border border-border/60 bg-background/90 px-4 py-2 shadow-sm shadow-black/5 backdrop-blur-xl md:flex">
          <ThemeSwitcherButton className="h-7 w-7 rounded-full border-0 bg-transparent" />
          <div className="h-4 w-px bg-border/50" />
          <LanguageSwitcher currentLang={lang} />
          <div className="h-4 w-px bg-border/50" />
          <Button variant="ghost" size="sm" className="h-7 rounded-full px-3 text-sm text-muted-foreground hover:text-foreground" asChild>
            <Link href={`/${lang}/faqs`}>FAQs</Link>
          </Button>
        </nav>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full border border-border/60 bg-background/90 shadow-sm shadow-black/5 backdrop-blur-xl md:hidden">
              <Menu className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px]">
            <SheetHeader>
              <SheetTitle>
                <Image
                  src="/images/logos/kebo-icon.svg"
                  alt="Kebo"
                  width={40}
                  height={40}
                  className="h-9 w-9"
                />
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-8 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ThemeSwitcherButton className="h-8 w-8 rounded-full" />
              </div>
              <LanguageSwitcher currentLang={lang} />
              <Button variant="ghost" asChild className="justify-start">
                <Link href={`/${lang}/faqs`}>FAQs</Link>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
