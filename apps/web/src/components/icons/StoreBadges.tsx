import Image from "next/image"

interface StoreBadgeProps {
  className?: string
}

export function AppStoreBadge({ className }: StoreBadgeProps) {
  return (
    <a
      href="https://apps.apple.com/app/kebo-tu-asistente-financiero/id6742430536"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-block transition-opacity hover:opacity-80 ${className || ""}`}
    >
      <Image
        src="/images/logos/appstore-logo.png"
        alt="Download on the App Store"
        width={140}
        height={42}
        className="h-[42px] w-auto rounded-md ring-1 ring-border/20 dark:ring-white/20 dark:shadow-[0_0_12px_rgba(255,255,255,0.15)]"
      />
    </a>
  )
}

export function GooglePlayBadge({ className }: StoreBadgeProps) {
  return (
    <a
      href="https://play.google.com/store/apps/details?id=com.kebo.app.mobile&hl"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-block transition-opacity hover:opacity-80 ${className || ""}`}
    >
      <Image
        src="/images/logos/googleplay-logo.png"
        alt="Get it on Google Play"
        width={140}
        height={42}
        className="h-[42px] w-auto rounded-md ring-1 ring-border/20 dark:ring-white/20 dark:shadow-[0_0_12px_rgba(255,255,255,0.15)]"
      />
    </a>
  )
}

export function StoreBadges({ className }: StoreBadgeProps) {
  return (
    <div className={`flex flex-col gap-3 sm:flex-row ${className || ""}`}>
      <AppStoreBadge />
      <GooglePlayBadge />
    </div>
  )
}

