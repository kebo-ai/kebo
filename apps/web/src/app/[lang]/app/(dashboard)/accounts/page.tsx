"use client"

import { useParams } from "next/navigation"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function formatCurrency(amount: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
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

function AccountItem({ account, lang }: { account: Account; lang: string }) {
  return (
    <Link
      href={`/${lang}/app/accounts/${account.id}`}
      className="flex items-center gap-4 p-4 hover:bg-accent rounded-lg transition-colors"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
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
        <p className="font-medium truncate">
          {account.customized_name || account.name}
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {account.bank_name && (
            <>
              <Building2 className="h-3 w-3" />
              <span>{account.bank_name}</span>
              <span>-</span>
            </>
          )}
          <span>{account.account_type || "Account"}</span>
          {account.is_default && (
            <span className="px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
              Default
            </span>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold">{formatCurrency(parseFloat(account.balance))}</p>
      </div>
    </Link>
  )
}

function AccountSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-4 w-20" />
    </div>
  )
}

export default function AccountsPage() {
  const params = useParams()
  const lang = params.lang as string

  const { data: accounts, isLoading } = useAccounts()

  const totalBalance =
    accounts?.reduce((sum, account) => sum + parseFloat(account.balance || "0"), 0) || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Accounts</h1>
          <p className="text-muted-foreground">
            Manage your bank accounts and cards
          </p>
        </div>
        <Button asChild>
          <Link href={`/${lang}/app/accounts/new`}>
            <Plus className="mr-2 h-4 w-4" />
            New Account
          </Link>
        </Button>
      </div>

      {/* Total Balance Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-32" />
          ) : (
            <p className="text-3xl font-bold">{formatCurrency(totalBalance)}</p>
          )}
        </CardContent>
      </Card>

      {/* Accounts List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Accounts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y">
              {[...Array(3)].map((_, i) => (
                <AccountSkeleton key={i} />
              ))}
            </div>
          ) : accounts && accounts.length > 0 ? (
            <div className="divide-y">
              {accounts.map((account) => (
                <AccountItem key={account.id} account={account} lang={lang} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No accounts yet</p>
              <Button asChild>
                <Link href={`/${lang}/app/accounts/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add your first account
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
