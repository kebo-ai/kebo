"use client"

import Link from "next/link"
import {
  Plus,
  Wallet,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Building2,
} from "lucide-react"

import { useAccounts } from "@/lib/api/hooks/use-accounts"
import type { Account } from "@/lib/api/types"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Avatar color palette
const avatarColors = [
  "bg-blue-500/20 text-blue-400",
  "bg-emerald-500/20 text-emerald-400",
  "bg-purple-500/20 text-purple-400",
  "bg-orange-500/20 text-orange-400",
  "bg-pink-500/20 text-pink-400",
]

function getAvatarColor(index: number) {
  return avatarColors[index % avatarColors.length]
}

function formatCurrency(amount: number, currency: string = "USD") {
  const parts = amount.toFixed(2).split(".")
  const dollars = new Intl.NumberFormat("en-US").format(parseInt(parts[0]))
  const cents = parts[1]
  return { dollars, cents, formatted: `$${dollars}.${cents}` }
}

function getAccountIcon(accountType?: string) {
  switch (accountType?.toLowerCase()) {
    case "credit card":
      return <CreditCard className="h-5 w-5" />
    case "savings":
      return <PiggyBank className="h-5 w-5" />
    case "investment":
      return <TrendingUp className="h-5 w-5" />
    default:
      return <Wallet className="h-5 w-5" />
  }
}

function AccountItem({
  account,
  index,
}: {
  account: Account
  index: number
}) {
  const { dollars, cents } = formatCurrency(parseFloat(account.balance))

  return (
    <Link
      href={`/accounts/${account.id}`}
      className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
    >
      <div
        className={`h-12 w-12 rounded-full flex items-center justify-center ${getAvatarColor(index)}`}
      >
        {account.icon_url ? (
          <img
            src={account.icon_url}
            alt=""
            className="h-6 w-6 object-contain"
          />
        ) : (
          getAccountIcon(account.account_type)
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-foreground font-medium truncate">
          {account.customized_name || account.name}
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground/70">
          {account.bank_name && (
            <>
              <Building2 className="h-3 w-3" />
              <span>{account.bank_name}</span>
              <span>-</span>
            </>
          )}
          <span>{account.account_type || "Account"}</span>
          {account.is_default && (
            <span className="px-1.5 py-0.5 text-xs bg-info/10 text-info rounded">
              Default
            </span>
          )}
        </div>
      </div>
      <div className="text-right">
        <span className="text-foreground font-semibold">${dollars}</span>
        <span className="text-muted-foreground">.{cents}</span>
      </div>
    </Link>
  )
}

function AccountSkeleton() {
  return (
    <div className="flex items-center gap-4 px-3 py-3">
      <Skeleton className="h-12 w-12 rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32 bg-muted" />
        <Skeleton className="h-3 w-24 bg-muted" />
      </div>
      <Skeleton className="h-4 w-20 bg-muted" />
    </div>
  )
}

export default function AccountsPage() {

  const { data: accounts, isLoading } = useAccounts()

  const totalBalance =
    accounts?.reduce(
      (sum, account) => sum + parseFloat(account.balance || "0"),
      0
    ) || 0

  const { dollars, cents } = formatCurrency(totalBalance)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Accounts</h1>
          <p className="text-muted-foreground text-sm">
            Manage your bank accounts and cards
          </p>
        </div>
        <Button className="rounded-full" asChild>
          <Link href={`/accounts/new`}>
            <Plus className="h-4 w-4" />
            New Account
          </Link>
        </Button>
      </div>

      {/* Total Balance Card */}
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-sm mb-2">Total Balance</p>
          {isLoading ? (
            <Skeleton className="h-10 w-40 bg-muted" />
          ) : (
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-foreground">${dollars}</span>
              <span className="text-xl font-bold text-muted-foreground">.{cents}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accounts List */}
      <Card>
        <div className="p-4 border-b border-border">
          <h2 className="text-foreground font-medium">Your Accounts</h2>
        </div>
        {isLoading ? (
          <div className="divide-y divide-border">
            {[...Array(3)].map((_, i) => (
              <AccountSkeleton key={i} />
            ))}
          </div>
        ) : accounts && accounts.length > 0 ? (
          <div className="divide-y divide-border">
            {accounts.map((account, index) => (
              <AccountItem
                key={account.id}
                account={account}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No accounts yet</p>
            <Button className="rounded-full" asChild>
              <Link href="/accounts/new">
                <Plus className="h-4 w-4" />
                Add your first account
              </Link>
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
