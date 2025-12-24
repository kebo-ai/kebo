import type { Metadata } from "next"
import localFont from "next/font/local"
import { ThemeProvider } from "next-themes"
import "../globals.css"
import { Analytics } from "@vercel/analytics/react"
import { i18n, type Locale } from "@/i18n/config"
import { getDictionary } from "@/i18n/get-dictionary"

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
})

const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>
}): Promise<Metadata> {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return {
    title: dict.metadata.title,
    description: dict.metadata.description,
    applicationName: dict.metadata.applicationName,
    appleWebApp: {
      capable: true,
      title: dict.metadata.appleWebApp.title,
      statusBarStyle: "default",
    },
    other: {
      "apple-itunes-app": "app-id=6742430536",
    },
    keywords: dict.metadata.keywords,
    authors: [{ name: "Kebo App" }],
    creator: "Kebo App",
    publisher: "Kebo App",
    openGraph: {
      type: "website",
      locale: lang === "es" ? "es_ES" : lang === "pt" ? "pt_BR" : "en_US",
      url: "https://kebo.app",
      siteName: dict.metadata.openGraph.siteName,
      title: dict.metadata.openGraph.title,
      description: dict.metadata.openGraph.description,
      images: [
        {
          url: "/KEBO-OpenSource-LK.png",
          width: 1200,
          height: 630,
          alt: "Kebo - Open Source Personal Finance App",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.metadata.twitter.title,
      description: dict.metadata.twitter.description,
      images: ["/KEBO-OpenSource-LK.png"],
      creator: "@kebo_app",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: "https://kebo.app",
      languages: {
        es: "https://kebo.app/es",
        en: "https://kebo.app/en",
        pt: "https://kebo.app/pt",
      },
    },
  }
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params

  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {/* Dotted grid background */}
          <div
            className="pointer-events-none fixed inset-0 z-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, hsl(var(--foreground) / 0.07) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              maskImage:
                "linear-gradient(to bottom, black 0%, black 30%, transparent 80%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, black 0%, black 30%, transparent 80%)",
            }}
            aria-hidden="true"
          />
          <Analytics />
          <div className="relative z-10">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  )
}
