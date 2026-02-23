import { Wallet, Brain, PieChart } from "lucide-react"

interface Feature {
  title: string
  description: string
  icon: keyof typeof iconMap
}

interface FeaturesProps {
  dict: {
    home: {
      features: {
        title: string
        description: string
        feature1: { title: string; description: string }
        feature2: { title: string; description: string }
        feature3: { title: string; description: string }
      }
    }
  }
}

const iconMap = {
  wallet: Wallet,
  brain: Brain,
  chart: PieChart,
}

export default function Features({ dict }: FeaturesProps) {
  const features: Feature[] = [
    {
      title: dict.home.features.feature1.title,
      description: dict.home.features.feature1.description,
      icon: "wallet",
    },
    {
      title: dict.home.features.feature2.title,
      description: dict.home.features.feature2.description,
      icon: "brain",
    },
    {
      title: dict.home.features.feature3.title,
      description: dict.home.features.feature3.description,
      icon: "chart",
    },
  ]

  return (
    <section className="relative py-24">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-grid-pattern-subtle mask-fade-edges opacity-50" />
      
      <div className="container relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            {dict.home.features.title}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {dict.home.features.description}
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = iconMap[feature.icon]
            return (
              <div
                key={feature.title}
                className="group rounded-2xl border border-border/50 bg-background/50 p-6 backdrop-blur-sm transition-all hover:border-border hover:bg-background"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 text-muted-foreground transition-colors group-hover:border-kebo-500/50 group-hover:text-kebo-600">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-lg font-medium">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
