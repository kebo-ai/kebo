import { AppleIcon, GooglePlayIcon } from "@/components/icons/StoreIcons"
import { Button } from "@/components/ui/button"

interface CTAProps {
  dict: {
    cta?: {
      title: string
      description: string
      appStore: string
      googlePlay: string
    }
  }
}

const defaultTexts = {
  title: "Ready to take control of your finances?",
  description: "Join 50,000+ users who are already managing their money smarter.",
  appStore: "App Store",
  googlePlay: "Google Play",
}

export default function CTA({ dict }: CTAProps) {
  const texts = dict.cta || defaultTexts

  return (
    <section className="relative py-24">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-b from-muted/50 to-background p-8 sm:p-12 lg:p-16">
          {/* Subtle gradient accent */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-kebo-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-kebo-400/10 blur-3xl" />
          
          <div className="relative z-10 text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {texts.title}
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground">
              {texts.description}
            </p>

            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="lg" className="h-12 gap-2.5 px-6 text-base" asChild>
                <a
                  href="https://apps.apple.com/app/kebo-tu-asistente-financiero/id6742430536"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <AppleIcon className="h-5 w-5" />
                  {texts.appStore}
                </a>
              </Button>
              <Button size="lg" variant="outline" className="h-12 gap-2.5 px-6 text-base" asChild>
                <a
                  href="https://play.google.com/store/apps/details?id=com.kebo.app.mobile&hl"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GooglePlayIcon className="h-5 w-5" />
                  {texts.googlePlay}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
