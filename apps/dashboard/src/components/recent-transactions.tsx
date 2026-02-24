"use client"

import { useRecentTransactions } from "@/lib/api/hooks"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  Plus,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

const basePath = ""

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

function getTransactionIcon(type: string) {
  switch (type) {
    case "Expense":
      return <ArrowDownCircle className="h-5 w-5 text-destructive" />
    case "Income":
      return <ArrowUpCircle className="h-5 w-5 text-success" />
    case "Transfer":
      return <ArrowLeftRight className="h-5 w-5 text-info" />
    default:
      return <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
  }
}

function formatCurrency(amount: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

export function RecentTransactions() {
  const { data, isLoading } = useRecentTransactions(5)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium text-foreground">
              Recent Transactions
            </span>
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium text-foreground">
            Recent Transactions
          </span>
          <Link
            href={`${basePath}/transactions`}
            className="text-info hover:text-info/80 text-sm flex items-center gap-1"
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
                className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${getAvatarColor(index)}`}
                >
                  {transaction.category_icon ? (
                    <span className="text-lg">
                      {transaction.category_icon}
                    </span>
                  ) : transaction.icon_url ? (
                    <img
                      src={transaction.icon_url}
                      alt=""
                      className="h-6 w-6 object-contain"
                    />
                  ) : (
                    getTransactionIcon(transaction.transaction_type)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-sm font-medium truncate">
                    {transaction.description ||
                      transaction.category_name ||
                      transaction.transaction_type}
                  </p>
                  <p className="text-muted-foreground/70 text-xs">
                    {format(new Date(transaction.date), "MMM d, yyyy")}
                  </p>
                </div>
                <div
                  className={`font-medium ${
                    transaction.transaction_type === "Income"
                      ? "text-success"
                      : transaction.transaction_type === "Expense"
                        ? "text-destructive"
                        : "text-foreground"
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
            <p className="text-muted-foreground text-sm mb-4">
              No transactions yet
            </p>
            <Button className="rounded-full" asChild>
              <Link href={`${basePath}/transactions/new`}>
                <Plus className="h-4 w-4" />
                Add Transaction
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
