import { getDictionary } from '@/i18n/get-dictionary'
import { Locale } from '@/i18n/config'
import FAQsContent from './FAQsContent'

export default async function FAQsPage({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return (
    <FAQsContent 
      faqs={dict.faqs.items}
      title={dict.faqs.title}
      notFound={dict.faqs.notFound}
      contactUs={dict.faqs.contactUs}
      lang={lang}
    />
  )
}

