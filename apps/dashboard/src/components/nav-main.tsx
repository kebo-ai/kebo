"use client"

import {
  Home,
  ArrowLeftRight,
  PiggyBank,
  BarChart3,
  MessageCircle,
  Wallet,
  Tags,
  Building2,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navItems: { href: string; icon: LucideIcon; label: string }[] = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/transactions", icon: ArrowLeftRight, label: "Transactions" },
  { href: "/budgets", icon: PiggyBank, label: "Budgets" },
  { href: "/reports", icon: BarChart3, label: "Reports" },
  { href: "/chat", icon: MessageCircle, label: "Kebo Wise" },
  { href: "/accounts", icon: Wallet, label: "Accounts" },
  { href: "/categories", icon: Tags, label: "Categories" },
  { href: "/banks", icon: Building2, label: "Banks" },
]

export function NavMain() {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href)

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
