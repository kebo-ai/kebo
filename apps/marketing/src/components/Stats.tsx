import { Users, Star, Download, Globe } from "lucide-react"

interface StatsProps {
  dict: {
    stats?: {
      users: string
      rating: string
      downloads: string
      countries: string
    }
  }
}

const stats = [
  { value: "50K+", labelKey: "users", icon: Users },
  { value: "70K+", labelKey: "downloads", icon: Download },
  { value: "4.8", labelKey: "rating", icon: Star },
  { value: "25+", labelKey: "countries", icon: Globe },
]

const defaultLabels = {
  users: "Total Users",
  rating: "App Rating",
  downloads: "Downloads",
  countries: "Countries",
}

export default function Stats({ dict }: StatsProps) {
  const labels = dict.stats || defaultLabels

  return (
    <section className="relative border-y border-border/50 py-16">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:gap-12 md:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            const label = labels[stat.labelKey as keyof typeof labels] || defaultLabels[stat.labelKey as keyof typeof defaultLabels]
            return (
              <div
                key={stat.labelKey}
                className="group flex flex-col items-center text-center"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground transition-colors group-hover:border-kebo-500/50 group-hover:text-kebo-600">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-3xl font-semibold tracking-tight sm:text-4xl">{stat.value}</span>
                <span className="mt-1.5 text-sm text-muted-foreground">{label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
