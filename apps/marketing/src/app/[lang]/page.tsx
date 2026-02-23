import type { Locale } from "@/i18n/config"

import AnnouncementBanner from "@/components/AnnouncementBanner"
import CTA from "@/components/CTA"
import Features from "@/components/Features"
import Footer from "@/components/Footer"
import Header from "@/components/Header"
import Hero from "@/components/Hero"
import Stats from "@/components/Stats"
import { getDictionary } from "@/i18n/get-dictionary"

export const dynamic = "force-dynamic"

export default async function Home({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  const screenshotLangMap: Record<string, string> = {
    es: "SPA",
    en: "ENG",
    pt: "PT",
  }

  const screenshotPrefix = screenshotLangMap[lang] || "SPA"

  const screenshots = [
    {
      src: `/images/screenshots/1170X2532-${screenshotPrefix}-01.svg`,
      alt: dict.home.screenshots.alt1,
    },
    {
      src: `/images/screenshots/1170X2532-${screenshotPrefix}-02.svg`,
      alt: dict.home.screenshots.alt2,
    },
    {
      src: `/images/screenshots/1170X2532-${screenshotPrefix}-03.svg`,
      alt: dict.home.screenshots.alt3,
    },
    {
      src: `/images/screenshots/1170X2532-${screenshotPrefix}-04.svg`,
      alt: dict.home.screenshots.alt4,
    },
    {
      src: `/images/screenshots/1170X2532-${screenshotPrefix}-05.svg`,
      alt: dict.home.screenshots.alt5,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header lang={lang} dict={dict} />
      <AnnouncementBanner lang={lang} />
      <main className="flex-1">
        <Hero dict={dict} screenshots={screenshots} />
        <Stats dict={dict} />
        <Features dict={dict} />
        <CTA dict={dict} />
      </main>
      <Footer lang={lang} dict={dict} />
    </div>
  )
}
