import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ScreenshotCarousel from '@/components/ScreenshotCarousel'
import FeatureHighlights from '@/components/FeatureHighlights'
import { getDictionary } from '@/i18n/get-dictionary'
import { Locale } from '@/i18n/config'

export const dynamic = 'force-dynamic'

export default async function Home({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  const screenshotLangMap: Record<string, string> = {
    'es': 'SPA',
    'en': 'ENG',
    'pt': 'PT'
  }
  
  const screenshotPrefix = screenshotLangMap[lang] || 'SPA'
  
  const screenshots = [
    {
      src: `/images/screenshots/1170X2532-${screenshotPrefix}-01.svg`,
      alt: dict.home.screenshots.alt1
    },
    {
      src: `/images/screenshots/1170X2532-${screenshotPrefix}-02.svg`,
      alt: dict.home.screenshots.alt2
    },
    {
      src: `/images/screenshots/1170X2532-${screenshotPrefix}-03.svg`,
      alt: dict.home.screenshots.alt3
    },
    {
      src: `/images/screenshots/1170X2532-${screenshotPrefix}-04.svg`,
      alt: dict.home.screenshots.alt4
    },
    {
      src: `/images/screenshots/1170X2532-${screenshotPrefix}-05.svg`,
      alt: dict.home.screenshots.alt5
    }
  ]

  const features = [
    {
      title: dict.home.features.feature1.title,
      description: dict.home.features.feature1.description,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      title: dict.home.features.feature2.title,
      description: dict.home.features.feature2.description,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      title: dict.home.features.feature3.title,
      description: dict.home.features.feature3.description,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header lang={lang} dict={dict} />
      
      <main className="flex-grow">
        <section className="py-12 sm:py-16 px-4 sm:px-6 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="w-full lg:w-1/2 text-center lg:text-left">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-4 py-1.5 text-sm font-medium text-green-800 mb-4 shadow-sm hover:bg-green-200 transition-colors">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  {dict.home.badge}
                </span>
                <h1 
                  className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4 sm:mb-6"
                  dangerouslySetInnerHTML={{ __html: dict.home.hero.title }}
                />
                <p className="text-lg text-gray-600 mb-8 sm:mb-10 max-w-xl mx-auto lg:mx-0">
                  {dict.home.hero.description}
                </p>
                <div className="mb-6">
                  <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                    <a 
                      href="https://apps.apple.com/app/kebo-tu-asistente-financiero/id6742430536" 
                      className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gray-800 hover:bg-gray-700 transition-colors"
                    >
                      <Image 
                        src="/images/logos/appstore-logo.png" 
                        alt="App Store" 
                        width={100} 
                        height={30} 
                        className="h-6 w-auto mr-2"
                      />
                      {dict.home.hero.appStore}
                    </a>
                    <a 
                      href="https://play.google.com/store/apps/details?id=com.kebo.app.mobile&hl" 
                      className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gray-800 hover:bg-gray-700 transition-colors"
                    >
                      <Image 
                        src="/images/logos/googleplay-logo.png" 
                        alt="Google Play" 
                        width={100} 
                        height={30} 
                        className="h-6 w-auto mr-2"
                      />
                      {dict.home.hero.googlePlay}
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="w-full lg:w-1/2 flex justify-center">
                <div className="max-w-[320px] w-full">
                  <ScreenshotCarousel images={screenshots} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
                {dict.home.features.title}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {dict.home.features.description}
              </p>
            </div>
            
            <FeatureHighlights features={features} />
          </div>
        </section>

      </main>

      <Footer lang={lang} dict={dict} />
    </div>
  )
}

