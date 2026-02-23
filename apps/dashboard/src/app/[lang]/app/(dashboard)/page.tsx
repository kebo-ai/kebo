"use client"

import {
  useBalance,
  useRecentTransactions,
  useAccounts,
} from "@/lib/api/hooks"
import { useAuth } from "@/lib/auth/hooks"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  Plus,
  Eye,
  EyeOff,
  Wallet,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  BarChart3,
  Send,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"
import { format } from "date-fns"

// Avatar color palette for accounts
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

function BalanceCard() {
  const { data: balance, isLoading } = useBalance()
  const [showBalance, setShowBalance] = useState(true)

  const formatCurrency = (amount: number, currency: string = "USD") => {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount)
    return formatted
  }

  // Format with superscript cents (Mercury style)
  const formatBalanceDisplay = (amount: number) => {
    const parts = amount.toFixed(2).split(".")
    const dollars = new Intl.NumberFormat("en-US").format(parseInt(parts[0]))
    const cents = parts[1]
    return { dollars, cents }
  }

  if (isLoading) {
    return (
      <div className="dash-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-32 bg-dash-card-hover" />
            <Skeleton className="h-4 w-4 rounded-full bg-dash-card-hover" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-lg bg-dash-card-hover" />
            <Skeleton className="h-8 w-8 rounded-lg bg-dash-card-hover" />
          </div>
        </div>
        <Skeleton className="h-10 w-48 bg-dash-card-hover mb-4" />
        <Skeleton className="h-4 w-40 bg-dash-card-hover" />
      </div>
    )
  }

  const balanceAmount = parseFloat(balance?.total_balance ?? "0")
  const { dollars, cents } = formatBalanceDisplay(balanceAmount)

  return (
    <div className="dash-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-dash-text-secondary text-sm font-medium">
            Kebo balance
          </span>
          <CheckCircle className="h-4 w-4 text-dash-success" />
        </div>
        <div className="flex gap-1">
          <button className="p-2 rounded-lg bg-dash-card-hover hover:bg-dash-border transition-colors">
            <BarChart3 className="h-4 w-4 text-dash-text-muted" />
          </button>
          <button
            className="p-2 rounded-lg hover:bg-dash-card-hover transition-colors"
            onClick={() => setShowBalance(!showBalance)}
          >
            {showBalance ? (
              <EyeOff className="h-4 w-4 text-dash-text-muted" />
            ) : (
              <Eye className="h-4 w-4 text-dash-text-muted" />
            )}
          </button>
        </div>
      </div>

      {/* Balance Amount */}
      <div className="mb-4">
        {showBalance ? (
          <div className="flex items-baseline">
            <span className="text-4xl font-bold text-dash-text">${dollars}</span>
            <span className="text-xl font-bold text-dash-text-muted">.{cents}</span>
          </div>
        ) : (
          <div className="text-4xl font-bold text-dash-text">$****.**</div>
        )}
      </div>

      {/* Period Stats */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-dash-text-muted">Last 30 days</span>
        <div className="flex items-center gap-1 text-dash-success">
          <TrendingUp className="h-3 w-3" />
          <span>$0</span>
        </div>
        <div className="flex items-center gap-1 text-dash-error">
          <TrendingDown className="h-3 w-3" />
          <span>-$0</span>
        </div>
      </div>
    </div>
  )
}

function QuickActions({ lang }: { lang: string }) {
  const basePath = `/${lang}/app`

  const actions = [
    {
      href: `${basePath}/transactions/new?type=Expense`,
      icon: Send,
      label: "Expense",
      primary: true,
    },
    {
      href: `${basePath}/transactions/new?type=Transfer`,
      icon: ArrowLeftRight,
      label: "Transfer",
    },
    {
      href: `${basePath}/transactions/new?type=Income`,
      icon: ArrowUpCircle,
      label: "Income",
    },
    {
      href: `${basePath}/accounts/new`,
      icon: Wallet,
      label: "Account",
    },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className={
            action.primary ? "dash-btn-pill-primary" : "dash-btn-pill"
          }
        >
          <action.icon className="h-4 w-4" />
          <span>{action.label}</span>
        </Link>
      ))}
    </div>
  )
}

function AccountsPanel({ lang }: { lang: string }) {
  const { data: accounts, isLoading } = useAccounts()
  const basePath = `/${lang}/app`

  const formatCurrency = (amount: number | string, currency: string = "USD") => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount
    const parts = num.toFixed(2).split(".")
    const dollars = new Intl.NumberFormat("en-US").format(parseInt(parts[0]))
    const cents = parts[1]
    return { dollars, cents }
  }

  if (isLoading) {
    return (
      <div className="dash-card p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-dash-text font-medium">Accounts</span>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-6 rounded bg-dash-card-hover" />
            <Skeleton className="h-6 w-6 rounded bg-dash-card-hover" />
          </div>
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full bg-dash-card-hover" />
              <Skeleton className="h-4 w-24 bg-dash-card-hover" />
              <Skeleton className="h-4 w-16 ml-auto bg-dash-card-hover" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const accountsList = accounts?.slice(0, 5) || []

  return (
    <div className="dash-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-dash-text font-medium">Accounts</span>
        <div className="flex gap-1">
          <Link
            href={`${basePath}/accounts/new`}
            className="p-1.5 rounded hover:bg-dash-card-hover transition-colors"
          >
            <Plus className="h-4 w-4 text-dash-text-muted" />
          </Link>
        </div>
      </div>

      {/* Account List */}
      <div className="space-y-1">
        {accountsList.length > 0 ? (
          accountsList.map((account, index) => {
            const { dollars, cents } = formatCurrency(account.balance)
            return (
              <Link
                key={account.id}
                href={`${basePath}/accounts/${account.id}`}
                className="dash-list-item"
              >
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium ${getAvatarColor(index)}`}
                >
                  {account.icon_url ? (
                    <img src={account.icon_url} alt="" className="h-6 w-6 object-contain" />
                  ) : (
                    account.name.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="flex-1 text-dash-text-secondary text-sm">
                  {account.name}
                </span>
                <div className="text-right">
                  <span className="text-dash-text font-medium">${dollars}</span>
                  <span className="text-dash-text-muted text-sm">.{cents}</span>
                </div>
              </Link>
            )
          })
        ) : (
          <div className="text-center py-6">
            <p className="text-dash-text-muted text-sm mb-3">No accounts yet</p>
            <Link href={`${basePath}/accounts/new`} className="dash-btn-pill">
              <Plus className="h-4 w-4" />
              Add Account
            </Link>
          </div>
        )}
      </div>

      {/* View All Link */}
      {accountsList.length > 0 && (
        <Link
          href={`${basePath}/accounts`}
          className="flex items-center gap-2 mt-4 pt-4 border-t border-dash-border text-dash-text-muted hover:text-dash-text transition-colors text-sm"
        >
          <div className="h-6 w-6 rounded-full bg-dash-card-hover flex items-center justify-center text-xs">
            +{Math.max(0, (accounts?.length || 0) - 5)}
          </div>
          <span>View all accounts</span>
        </Link>
      )}
    </div>
  )
}

function RecentTransactions({ lang }: { lang: string }) {
  const { data, isLoading } = useRecentTransactions(5)
  const basePath = `/${lang}/app`

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount)
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "Expense":
        return <ArrowDownCircle className="h-5 w-5 text-dash-error" />
      case "Income":
        return <ArrowUpCircle className="h-5 w-5 text-dash-success" />
      case "Transfer":
        return <ArrowLeftRight className="h-5 w-5 text-dash-accent" />
      default:
        return <ArrowLeftRight className="h-5 w-5 text-dash-text-muted" />
    }
  }

  if (isLoading) {
    return (
      <div className="dash-card p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-dash-text font-medium">Recent Transactions</span>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full bg-dash-card-hover" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-32 bg-dash-card-hover" />
                <Skeleton className="h-3 w-24 bg-dash-card-hover" />
              </div>
              <Skeleton className="h-4 w-16 bg-dash-card-hover" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="dash-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-dash-text font-medium">Recent Transactions</span>
        <Link
          href={`${basePath}/transactions`}
          className="text-dash-accent hover:text-dash-accent/80 text-sm flex items-center gap-1"
        >
          View
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Transaction List */}
      {data?.data && data.data.length > 0 ? (
        <div className="space-y-1">
          {data.data.map((transaction, index) => (
            <Link
              key={transaction.id}
              href={`${basePath}/transactions/${transaction.id}`}
              className="dash-list-item"
            >
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${getAvatarColor(index)}`}
              >
                {transaction.category_icon ? (
                  <span className="text-lg">
                    {transaction.category_icon}
                  </span>
                ) : transaction.icon_url ? (
                  <img src={transaction.icon_url} alt="" className="h-6 w-6 object-contain" />
                ) : (
                  getTransactionIcon(transaction.transaction_type)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-dash-text-secondary text-sm font-medium truncate">
                  {transaction.description ||
                    transaction.category_name ||
                    transaction.transaction_type}
                </p>
                <p className="text-dash-text-dim text-xs">
                  {format(new Date(transaction.date), "MMM d, yyyy")}
                </p>
              </div>
              <div
                className={`font-medium ${
                  transaction.transaction_type === "Income"
                    ? "text-dash-success"
                    : transaction.transaction_type === "Expense"
                      ? "text-dash-error"
                      : "text-dash-text"
                }`}
              >
                {transaction.transaction_type === "Income" ? "+" : "-"}
                {formatCurrency(transaction.amount, transaction.currency)}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-dash-text-muted text-sm mb-4">No transactions yet</p>
          <Link href={`${basePath}/transactions/new`} className="dash-btn-pill-primary">
            <Plus className="h-4 w-4" />
            Add Transaction
          </Link>
        </div>
      )}
    </div>
  )
}

function KeboWiseCard({ lang }: { lang: string }) {
  const basePath = `/${lang}/app`

  const sampleQuestions = [
    "How am I doing this month?",
    "Where am I spending the most?",
    "How can I save more?",
  ]

  return (
    <div className="dash-card p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-kebo-500/20 to-kebo-600/20 flex items-center justify-center">
          <span className="text-xl">🧠</span>
        </div>
        <div>
          <span className="text-dash-text font-medium">Kebo Wise</span>
          <p className="text-dash-text-dim text-xs">AI Financial Assistant</p>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-2">
        {sampleQuestions.map((question) => (
          <Link
            key={question}
            href={`${basePath}/chat?q=${encodeURIComponent(question)}`}
            className="block w-full text-left p-3 rounded-lg border border-dash-border hover:bg-dash-card-hover hover:border-dash-accent/30 transition-all text-dash-text-secondary text-sm"
          >
            {question}
          </Link>
        ))}
      </div>

      {/* CTA */}
      <Link
        href={`${basePath}/chat`}
        className="mt-4 flex items-center justify-center gap-2 w-full p-3 rounded-lg bg-gradient-to-r from-kebo-500/10 to-kebo-600/10 border border-kebo-500/20 text-kebo-400 hover:from-kebo-500/20 hover:to-kebo-600/20 transition-all text-sm font-medium"
      >
        Start a conversation
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

export default function DashboardPage() {
  const params = useParams()
  const lang = params.lang as string
  const { user } = useAuth()

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "there"

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-dash-text">
          Welcome, {firstName}
        </h1>
        <QuickActions lang={lang} />
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Balance & Transactions */}
        <div className="lg:col-span-2 space-y-6">
          <BalanceCard />
          <RecentTransactions lang={lang} />
        </div>

        {/* Right Column - Accounts & Kebo Wise */}
        <div className="space-y-6">
          <AccountsPanel lang={lang} />
          <KeboWiseCard lang={lang} />
        </div>
      </div>
    </div>
  )
}
