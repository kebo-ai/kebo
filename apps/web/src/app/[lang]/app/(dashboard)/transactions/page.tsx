"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import {
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  Plus,
  Filter,
  Search,
} from "lucide-react"

import { useTransactions } from "@/lib/api/hooks"
import { useAccounts } from "@/lib/api/hooks/use-accounts"
import { useCategories } from "@/lib/api/hooks/use-categories"
import type { Transaction, TransactionType } from "@/lib/api/types"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function TransactionIcon({ type }: { type: TransactionType }) {
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

function TransactionItem({
  transaction,
  lang,
}: {
  transaction: Transaction
  lang: string
}) {
  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount)
  }

  return (
    <Link
      href={`/${lang}/app/transactions/${transaction.id}`}
      className="flex items-center gap-4 p-4 hover:bg-accent rounded-lg transition-colors"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        {transaction.category_icon ? (
          <span className="text-lg">{transaction.category_icon}</span>
        ) : (
          <TransactionIcon type={transaction.transaction_type} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">
          {transaction.description ||
            transaction.category_name ||
            transaction.transaction_type}
        </p>
        <p className="text-sm text-muted-foreground">
          {transaction.account_name} • {format(new Date(transaction.date), "MMM d, yyyy")}
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
  )
}

function TransactionSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-4 w-20" />
    </div>
  )
}

export default function TransactionsPage() {
  const params = useParams()
  const lang = params.lang as string

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <Button asChild>
          <Link href={`/${lang}/app/transactions/new`}>
            <Plus className="mr-2 h-4 w-4" />
            New Transaction
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
              value={filters.transaction_type}
              onValueChange={(value) =>
                setFilters((f) => ({ ...f, transaction_type: value === "all" ? "" : value }))
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Expense">Expense</SelectItem>
                <SelectItem value="Income">Income</SelectItem>
                <SelectItem value="Transfer">Transfer</SelectItem>
              </SelectContent>
            </Select>

            {/* Account Filter */}
            <Select
              value={filters.account_id}
              onValueChange={(value) =>
                setFilters((f) => ({ ...f, account_id: value === "all" ? "" : value }))
              }
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Accounts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {accounts?.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.customized_name || account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select
              value={filters.category_id}
              onValueChange={(value) =>
                setFilters((f) => ({ ...f, category_id: value === "all" ? "" : value }))
              }
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories
                  ?.filter((c) => c.is_visible && !c.is_deleted)
                  .map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon_emoji} {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y">
              {[...Array(5)].map((_, i) => (
                <TransactionSkeleton key={i} />
              ))}
            </div>
          ) : transactions.length > 0 ? (
            <>
              <div className="divide-y">
                {transactions.map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    lang={lang}
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
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No transactions found</p>
              <Button asChild>
                <Link href={`/${lang}/app/transactions/new`}>
                  <Plus className="mr-2 h-4 w-4" />
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
