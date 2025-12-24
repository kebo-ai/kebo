import Image from 'next/image'
import Link from 'next/link'
import { Locale } from '@/i18n/config'

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

export default function Footer({ lang, dict }: FooterProps) {
  const footerLinks = {
    productos: [
      { name: dict.footer.products.howItWorks, href: `/${lang}/como-funciona` },
      { name: dict.footer.products.integrations, href: `/${lang}/integraciones` },
      { name: dict.footer.products.pricing, href: `/${lang}/precios` },
      { name: dict.footer.products.faqs, href: `/${lang}/faqs` },
    ],
    compania: [
      { name: dict.footer.company.about, href: `/${lang}/nosotros` },
      { name: dict.footer.company.careers, href: `/${lang}/careers` },
      { name: dict.footer.company.blog, href: `/${lang}/blog` },
    ],
    legal: [
      { name: dict.footer.legal.terms, href: `/${lang}/terminos` },
      { name: dict.footer.legal.privacy, href: `/${lang}/politica-de-privacidad` },
    ],
  }

  return (
    <footer className="bg-gray-100 text-gray-800 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div className="space-y-5">
            <Image 
              src="/images/logos/footer-logo.png" 
              alt="Kebo Logo" 
              width={100} 
              height={35} 
              className="hover:opacity-90 transition-opacity"
            />
            <div className="space-y-2 text-gray-600">
              <p className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                {dict.footer.email}
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-base mb-4 text-gray-800">{dict.footer.products.title}</h3>
            <ul className="space-y-2 text-sm">
              {footerLinks.productos.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-600 hover:text-gray-900 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-base mb-4 text-gray-800">{dict.footer.company.title}</h3>
            <ul className="space-y-2 text-sm">
              {footerLinks.compania.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-600 hover:text-gray-900 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-base mb-4 text-gray-800">{dict.footer.download}</h3>
              <div className="flex flex-row gap-3">
                <a href="https://apps.apple.com/app/kebo-tu-asistente-financiero/id6742430536">
                  <Image 
                    src="/images/logos/appstore-logo.png" 
                    alt="App Store" 
                    width={120} 
                    height={40} 
                    className="hover:opacity-90 transition-opacity cursor-pointer"
                  />
                </a>
                <a href="https://play.google.com/store/apps/details?id=com.kebo.app.mobile&hl">
                  <Image 
                    src="/images/logos/googleplay-logo.png" 
                    alt="Google Play" 
                    width={120} 
                    height={40} 
                    className="hover:opacity-90 transition-opacity cursor-pointer"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500">
              {dict.footer.copyright}
            </p>
            <div className="flex gap-6">
              {footerLinks.legal.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 