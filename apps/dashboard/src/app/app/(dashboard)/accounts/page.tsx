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

import { Skeleton } from "@/components/ui/skeleton"

// Avatar color palette
const avatarColors = [
  "dash-avatar-blue",
  "dash-avatar-green",
  "dash-avatar-purple",
  "dash-avatar-orange",
  "dash-avatar-pink",
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
      href={`/app/accounts/${account.id}`}
      className="dash-list-item"
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
        <p className="text-dash-text-secondary font-medium truncate">
          {account.customized_name || account.name}
        </p>
        <div className="flex items-center gap-2 text-sm text-dash-text-dim">
          {account.bank_name && (
            <>
              <Building2 className="h-3 w-3" />
              <span>{account.bank_name}</span>
              <span>-</span>
            </>
          )}
          <span>{account.account_type || "Account"}</span>
          {account.is_default && (
            <span className="px-1.5 py-0.5 text-xs bg-dash-accent/10 text-dash-accent rounded">
              Default
            </span>
          )}
        </div>
      </div>
      <div className="text-right">
        <span className="text-dash-text font-semibold">${dollars}</span>
        <span className="text-dash-text-muted">.{cents}</span>
      </div>
    </Link>
  )
}

function AccountSkeleton() {
  return (
    <div className="flex items-center gap-4 px-3 py-3">
      <Skeleton className="h-12 w-12 rounded-full bg-dash-card-hover" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32 bg-dash-card-hover" />
        <Skeleton className="h-3 w-24 bg-dash-card-hover" />
      </div>
      <Skeleton className="h-4 w-20 bg-dash-card-hover" />
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
          <h1 className="text-2xl font-semibold text-dash-text">Accounts</h1>
          <p className="text-dash-text-muted text-sm">
            Manage your bank accounts and cards
          </p>
        </div>
        <Link href={`/app/accounts/new`} className="dash-btn-pill-primary">
          <Plus className="h-4 w-4" />
          New Account
        </Link>
      </div>

      {/* Total Balance Card */}
      <div className="dash-card p-6">
        <p className="text-dash-text-muted text-sm mb-2">Total Balance</p>
        {isLoading ? (
          <Skeleton className="h-10 w-40 bg-dash-card-hover" />
        ) : (
          <div className="flex items-baseline">
            <span className="text-4xl font-bold text-dash-text">${dollars}</span>
            <span className="text-xl font-bold text-dash-text-muted">.{cents}</span>
          </div>
        )}
      </div>

      {/* Accounts List */}
      <div className="dash-card">
        <div className="p-4 border-b border-dash-border">
          <h2 className="text-dash-text font-medium">Your Accounts</h2>
        </div>
        {isLoading ? (
          <div className="divide-y divide-dash-border">
            {[...Array(3)].map((_, i) => (
              <AccountSkeleton key={i} />
            ))}
          </div>
        ) : accounts && accounts.length > 0 ? (
          <div className="divide-y divide-dash-border">
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
            <Wallet className="h-12 w-12 mx-auto text-dash-text-muted mb-4" />
            <p className="text-dash-text-muted mb-4">No accounts yet</p>
            <Link href="/app/accounts/new" className="dash-btn-pill-primary">
              <Plus className="h-4 w-4" />
              Add your first account
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
