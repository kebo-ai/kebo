import { AppStoreBadge, GooglePlayBadge } from "@/components/icons/StoreBadges"

interface CTAProps {
  dict: {
    cta?: {
      title: string
      description: string
    }
  }
}

const defaultTexts = {
  title: "Ready to take control of your finances?",
  description: "Join 50,000+ users who are already managing their money smarter.",
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

            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <AppStoreBadge />
              <GooglePlayBadge />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
