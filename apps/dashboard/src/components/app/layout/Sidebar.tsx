"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import {
  Home,
  ArrowLeftRight,
  PiggyBank,
  BarChart3,
  MessageCircle,
  Wallet,
  Tags,
  Building2,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/lib/auth/hooks"
import { useState } from "react"

interface SidebarProps {
  user?: User
}

const basePath = "/app"

const navItems = [
  { href: "", icon: Home, label: "Home" },
  { href: "/transactions", icon: ArrowLeftRight, label: "Transactions" },
  { href: "/budgets", icon: PiggyBank, label: "Budgets" },
  { href: "/reports", icon: BarChart3, label: "Reports" },
  { href: "/chat", icon: MessageCircle, label: "Kebo Wise" },
  { href: "/accounts", icon: Wallet, label: "Accounts" },
  { href: "/categories", icon: Tags, label: "Categories" },
  { href: "/banks", icon: Building2, label: "Banks" },
]

function NavItem({
  href,
  icon: Icon,
  label,
  isActive,
  collapsed,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  isActive: boolean
  collapsed: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-dash-accent text-white"
          : "text-dash-text-muted hover:bg-dash-card hover:text-dash-text",
        collapsed && "justify-center px-2"
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span>{label}</span>}
    </Link>
  )
}

function SidebarContent({
  collapsed,
  onCollapse,
  serverUser,
}: {
  collapsed: boolean
  onCollapse?: () => void
  serverUser?: User
}) {
  const pathname = usePathname()
  const { user: clientUser, signOut } = useAuth()

  // Use server user if available, fallback to client user
  const user = serverUser || clientUser

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    if (email) {
      return email[0].toUpperCase()
    }
    return "U"
  }

  return (
    <div className="flex h-full flex-col bg-dash-bg">
      {/* Logo Header */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-dash-border px-4",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        {!collapsed && (
          <Link href={basePath} className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-kebo-500 to-kebo-600 text-white font-bold text-lg shadow-lg shadow-kebo-500/20">
              K
            </div>
            <span className="text-lg font-semibold text-dash-text">Kebo</span>
          </Link>
        )}
        {collapsed && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-kebo-500 to-kebo-600 text-white font-bold text-lg shadow-lg shadow-kebo-500/20">
            K
          </div>
        )}
        {onCollapse && !collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onCollapse}
            className="text-dash-text-muted hover:text-dash-text hover:bg-dash-card"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        {onCollapse && collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onCollapse}
            className="text-dash-text-muted hover:text-dash-text hover:bg-dash-card absolute -right-3 top-5 h-6 w-6 rounded-full border border-dash-border bg-dash-bg"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const fullHref = `${basePath}${item.href}`
            const isActive =
              item.href === ""
                ? pathname === basePath
                : pathname.startsWith(fullHref)

            return (
              <NavItem
                key={item.href}
                href={fullHref}
                icon={item.icon}
                label={item.label}
                isActive={isActive}
                collapsed={collapsed}
              />
            )
          })}
        </nav>
      </ScrollArea>

      {/* User Menu */}
      <div className="border-t border-dash-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 hover:bg-dash-card",
                collapsed && "justify-center px-2"
              )}
            >
              <Avatar className="h-9 w-9 border-2 border-dash-border">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-dash-card text-dash-text text-sm font-medium">
                  {getInitials(user?.user_metadata?.full_name, user?.email)}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-medium text-dash-text truncate max-w-[140px]">
                    {user?.user_metadata?.full_name || "User"}
                  </span>
                  <span className="text-xs text-dash-text-muted truncate max-w-[140px]">
                    {user?.email}
                  </span>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-dash-card border-dash-border"
          >
            <DropdownMenuItem
              asChild
              className="text-dash-text-secondary hover:bg-dash-card-hover hover:text-dash-text focus:bg-dash-card-hover focus:text-dash-text"
            >
              <Link href={`${basePath}/settings`}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-dash-border" />
            <DropdownMenuItem
              onClick={signOut}
              className="text-dash-error hover:bg-dash-card-hover focus:bg-dash-card-hover focus:text-dash-error"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export function Sidebar({ user }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-dash-border bg-dash-bg transition-all duration-300 relative",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarContent
          collapsed={collapsed}
          onCollapse={() => setCollapsed(!collapsed)}
          serverUser={user}
        />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-40 bg-dash-card border border-dash-border text-dash-text hover:bg-dash-card-hover"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-64 p-0 bg-dash-bg border-dash-border"
        >
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SidebarContent collapsed={false} serverUser={user} />
        </SheetContent>
      </Sheet>
    </>
  )
}
