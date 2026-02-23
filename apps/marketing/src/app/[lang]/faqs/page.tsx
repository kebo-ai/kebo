import Footer from "@/components/Footer"
import Header from "@/components/Header"
import type { Locale } from "@/i18n/config"
import { getDictionary } from "@/i18n/get-dictionary"
import FAQsContent from "./FAQsContent"

export default async function FAQsPage({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return (
    <div className="flex min-h-screen flex-col">
      <Header lang={lang} dict={dict} />
      <main className="flex-1">
        <FAQsContent
          faqs={dict.faqs.items}
          title={dict.faqs.title}
          notFound={dict.faqs.notFound}
          contactUs={dict.faqs.contactUs}
          lang={lang}
        />
      </main>
      <Footer lang={lang} dict={dict} />
    </div>
  )
}
