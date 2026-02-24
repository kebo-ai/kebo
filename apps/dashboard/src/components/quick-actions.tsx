"use client"

import { ArrowLeftRight, ArrowUpCircle, Send, Wallet } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const actions = [
  {
    href: "/transactions/new?type=Expense",
    icon: Send,
    label: "Expense",
    primary: true,
  },
  {
    href: "/transactions/new?type=Transfer",
    icon: ArrowLeftRight,
    label: "Transfer",
  },
  {
    href: "/transactions/new?type=Income",
    icon: ArrowUpCircle,
    label: "Income",
  },
  {
    href: "/accounts/new",
    icon: Wallet,
    label: "Account",
  },
]

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant={action.primary ? "default" : "outline"}
          className="rounded-full"
          asChild
        >
          <Link href={action.href}>
            <action.icon className="h-4 w-4" />
            <span>{action.label}</span>
          </Link>
        </Button>
      ))}
    </div>
  )
}
