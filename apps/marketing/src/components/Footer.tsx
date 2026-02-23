import Link from "next/link"
import { Mail } from "lucide-react"
import { AppStoreBadge, GooglePlayBadge } from "@/components/icons/StoreBadges"
import { CrafterStationLogo } from "@/components/logos/crafter-station"
import { MoralejaDesignLogo } from "@/components/logos/moraleja"
import { KeboWordmark } from "@/components/logos/kebo-wordmark"
import { GithubLogo } from "@/components/logos/github"
import { InstagramLogo } from "@/components/logos/instagram"
import { LinkedinLogo } from "@/components/logos/linkedin"
import { Locale } from "@/i18n/config"

interface FooterProps {
  lang: Locale
  dict: {
    footer: {
      email: string
      products: {
        title: string
        howItWorks: string
        integrations: string
        pricing: string
        faqs: string
      }
      company: {
        title: string
        about: string
        careers: string
        blog: string
      }
      download: string
      copyright: string
      legal: {
        terms: string
        privacy: string
      }
    }
  }
}

const supporters = [
  {
    name: "Crafter Station",
    href: "https://crafterstation.com",
    Logo: CrafterStationLogo,
  },
  {
    name: "Moraleja Design",
    href: "https://moraleja.co",
    Logo: MoralejaDesignLogo,
  },
]

export default function Footer({ lang, dict }: FooterProps) {
  const footerLinks = {
    products: [
      { name: dict.footer.products.faqs, href: `/${lang}/faqs` },
    ],
    legal: [
      { name: dict.footer.legal.terms, href: `/${lang}/terms` },
      { name: dict.footer.legal.privacy, href: `/${lang}/privacy-policy` },
    ],
  }

  return (
    <footer className="border-t border-border/50">
      <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href={`/${lang}`} className="inline-block">
              <KeboWordmark className="h-8 w-auto opacity-90 transition-opacity hover:opacity-100" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Your finances under control, your future brighter.
            </p>

            {/* Social Links */}
            <div className="mt-6 flex items-center gap-4">
              <a
                href="https://github.com/kebo-ai/kebo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground/60 transition-colors hover:text-foreground"
                aria-label="GitHub"
              >
                <GithubLogo className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/kebo.finanzas/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground/60 transition-colors hover:text-foreground"
                aria-label="Instagram"
              >
                <InstagramLogo className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com/company/kebo-app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground/60 transition-colors hover:text-foreground"
                aria-label="LinkedIn"
              >
                <LinkedinLogo className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-4 text-sm font-medium">{dict.footer.products.title}</h3>
            <ul className="space-y-3">
              {footerLinks.products.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${dict.footer.email}`}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {dict.footer.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Download */}
          <div>
            <h3 className="mb-4 text-sm font-medium">{dict.footer.download}</h3>
            <div className="flex flex-col gap-2">
              <AppStoreBadge />
              <GooglePlayBadge />
            </div>
          </div>
        </div>

        {/* Supported by */}
        <div className="mt-12 border-t border-border/50 pt-8">
          <p className="mb-4 text-center text-xs text-muted-foreground">Supported by</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {supporters.map((supporter) => (
              <a
                key={supporter.name}
                href={supporter.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={supporter.name}
              >
                <supporter.Logo className="h-6 w-6 opacity-60 transition-opacity group-hover:opacity-100" />
                <span className="text-sm font-medium opacity-60 transition-opacity group-hover:opacity-100">
                  {supporter.name}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">{dict.footer.copyright}</p>
          <div className="flex gap-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
