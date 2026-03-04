"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeSwitcherToggle } from "@/components/theme-switcher-button"

export function SiteHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border/50 px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
      </div>
      <ThemeSwitcherToggle />
    </header>
  )
}
