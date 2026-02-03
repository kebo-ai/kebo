"use client"

import { useBalance, useRecentTransactions } from "@/lib/api/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  Plus,
  Eye,
  EyeOff,
  Wallet,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"
import { format } from "date-fns"

function BalanceCard() {
  const { data: balance, isLoading } = useBalance()
  const [showBalance, setShowBalance] = useState(true)

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount)
  }

  if (isLoading) {
    return (
      <Card className="bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle className="text-sm font-medium opacity-80">
            Total Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-48 bg-primary-foreground/20" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-primary text-primary-foreground">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium opacity-80">
          Total Balance
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="text-primary-foreground hover:bg-primary-foreground/10"
          onClick={() => setShowBalance(!showBalance)}
        >
          {showBalance ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {showBalance
            ? formatCurrency(parseFloat(balance?.total_balance ?? "0"))
            : "****"}
        </div>
      </CardContent>
    </Card>
  )
}

function QuickActions({ lang }: { lang: string }) {
  const basePath = `/${lang}/app`

  const actions = [
    {
      href: `${basePath}/transactions/new?type=Expense`,
      icon: ArrowDownCircle,
      label: "Expense",
      color: "text-red-500",
    },
    {
      href: `${basePath}/transactions/new?type=Income`,
      icon: ArrowUpCircle,
      label: "Income",
      color: "text-green-500",
    },
    {
      href: `${basePath}/transactions/new?type=Transfer`,
      icon: ArrowLeftRight,
      label: "Transfer",
      color: "text-blue-500",
    },
    {
      href: `${basePath}/accounts/new`,
      icon: Wallet,
      label: "Account",
      color: "text-purple-500",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4">
          {actions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <action.icon className={`h-8 w-8 ${action.color}`} />
              <span className="text-sm font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
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
        return <ArrowDownCircle className="h-5 w-5 text-red-500" />
      case "Income":
        return <ArrowUpCircle className="h-5 w-5 text-green-500" />
      case "Transfer":
        return <ArrowLeftRight className="h-5 w-5 text-blue-500" />
      default:
        return <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Recent Transactions</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`${basePath}/transactions`}>View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {data?.data && data.data.length > 0 ? (
          <div className="space-y-4">
            {data.data.map((transaction) => (
              <Link
                key={transaction.id}
                href={`${basePath}/transactions/${transaction.id}`}
                className="flex items-center gap-4 p-2 -mx-2 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  {transaction.icon_url || transaction.category_icon ? (
                    <span className="text-lg">
                      {transaction.category_icon || transaction.icon_url}
                    </span>
                  ) : (
                    getTransactionIcon(transaction.transaction_type)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {transaction.description ||
                      transaction.category_name ||
                      transaction.transaction_type}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(transaction.date), "MMM d, yyyy")}
                  </p>
                </div>
                <div
                  className={`font-semibold ${
                    transaction.transaction_type === "Income"
                      ? "text-green-600"
                      : transaction.transaction_type === "Expense"
                        ? "text-red-600"
                        : ""
                  }`}
                >
                  {transaction.transaction_type === "Income" ? "+" : "-"}
                  {formatCurrency(transaction.amount, transaction.currency)}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No transactions yet</p>
            <Button className="mt-4" asChild>
              <Link href={`${basePath}/transactions/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="text-2xl">🧠</span>
          Kebo Wise
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Ask me anything about your finances
        </p>
        <div className="space-y-2">
          {sampleQuestions.map((question) => (
            <Button
              key={question}
              variant="outline"
              className="w-full justify-start text-left h-auto py-3"
              asChild
            >
              <Link href={`${basePath}/chat?q=${encodeURIComponent(question)}`}>
                {question}
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const params = useParams()
  const lang = params.lang as string

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href={`/${lang}/app/transactions/new`}>
            <Plus className="mr-2 h-4 w-4" />
            New Transaction
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <BalanceCard />
        <QuickActions lang={lang} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentTransactions lang={lang} />
        <KeboWiseCard lang={lang} />
      </div>
    </div>
  )
}
