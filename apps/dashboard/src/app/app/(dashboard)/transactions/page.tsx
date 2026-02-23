"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import {
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

import { useTransactions } from "@/lib/api/hooks"
import { useAccounts } from "@/lib/api/hooks/use-accounts"
import { useCategories } from "@/lib/api/hooks/use-categories"
import type { Transaction, TransactionType } from "@/lib/api/types"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

function TransactionIcon({ type }: { type: TransactionType }) {
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

function TransactionItem({
  transaction,
  index,
}: {
  transaction: Transaction
  index: number
}) {
  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount)
  }

  return (
    <Link
      href={`/app/transactions/${transaction.id}`}
      className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
    >
      <div
        className={`h-10 w-10 rounded-full flex items-center justify-center ${getAvatarColor(index)}`}
      >
        {transaction.category_icon ? (
          <span className="text-lg">{transaction.category_icon}</span>
        ) : (
          <TransactionIcon type={transaction.transaction_type} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-foreground text-sm font-medium truncate">
          {transaction.description ||
            transaction.category_name ||
            transaction.transaction_type}
        </p>
        <p className="text-muted-foreground/70 text-xs">
          {transaction.account_name} •{" "}
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
  )
}

function TransactionSkeleton() {
  return (
    <div className="flex items-center gap-4 px-3 py-3">
      <Skeleton className="h-10 w-10 rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32 bg-muted" />
        <Skeleton className="h-3 w-24 bg-muted" />
      </div>
      <Skeleton className="h-4 w-20 bg-muted" />
    </div>
  )
}

export default function TransactionsPage() {

  const [filters, setFilters] = useState({
    account_id: "",
    category_id: "",
    transaction_type: "",
    search: "",
  })
  const [page, setPage] = useState(1)

  const { data, isLoading } = useTransactions({
    account_id: filters.account_id || undefined,
    category_id: filters.category_id || undefined,
    transaction_type: filters.transaction_type || undefined,
    limit: 20,
    offset: (page - 1) * 20,
  })

  const { data: accounts } = useAccounts()
  const { data: categories } = useCategories()

  const transactions = data?.data || []
  const totalPages = Math.ceil((data?.total || 0) / 20)

  const clearFilters = () => {
    setFilters({
      account_id: "",
      category_id: "",
      transaction_type: "",
      search: "",
    })
    setPage(1)
  }

  const hasActiveFilters =
    filters.account_id || filters.category_id || filters.transaction_type

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-foreground">Transactions</h1>
        <Button className="rounded-full" asChild>
          <Link href="/app/transactions/new">
            <Plus className="h-4 w-4" />
            New Transaction
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
              <Input
                placeholder="Search transactions..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, search: e.target.value }))
                }
                className="pl-9"
              />
            </div>

            {/* Type Filter */}
            <Select
              value={filters.transaction_type || "all"}
              onValueChange={(value) =>
                setFilters((f) => ({
                  ...f,
                  transaction_type: value === "all" ? "" : value,
                }))
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  All Types
                </SelectItem>
                <SelectItem value="Expense">
                  Expense
                </SelectItem>
                <SelectItem value="Income">
                  Income
                </SelectItem>
                <SelectItem value="Transfer">
                  Transfer
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Account Filter */}
            <Select
              value={filters.account_id || "all"}
              onValueChange={(value) =>
                setFilters((f) => ({
                  ...f,
                  account_id: value === "all" ? "" : value,
                }))
              }
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Accounts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  All Accounts
                </SelectItem>
                {accounts?.map((account) => (
                  <SelectItem
                    key={account.id}
                    value={account.id}
                  >
                    {account.customized_name || account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select
              value={filters.category_id || "all"}
              onValueChange={(value) =>
                setFilters((f) => ({
                  ...f,
                  category_id: value === "all" ? "" : value,
                }))
              }
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  All Categories
                </SelectItem>
                {categories
                  ?.filter((c) => c.is_visible && !c.is_deleted)
                  .map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id}
                    >
                      {category.icon_emoji} {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y divide-border">
              {[...Array(5)].map((_, i) => (
                <TransactionSkeleton key={i} />
              ))}
            </div>
          ) : transactions.length > 0 ? (
            <>
              <div className="divide-y divide-border">
                {transactions.map((transaction, index) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    index={index}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="rounded-full"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-full"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No transactions found</p>
              <Button className="rounded-full" asChild>
                <Link href="/app/transactions/new">
                  <Plus className="h-4 w-4" />
                  Add your first transaction
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
