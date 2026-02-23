"use client"

import Link from "next/link"
import { format } from "date-fns"
import { Plus, PiggyBank, Calendar, TrendingUp } from "lucide-react"

import { useBudgets } from "@/lib/api/hooks/use-budgets"
import type { Budget } from "@/lib/api/types"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function formatCurrency(amount: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

function BudgetItem({ budget }: { budget: Budget }) {
  const budgetAmount = parseFloat(budget.budget_amount || "0")
  const spent = parseFloat(budget.total_spent || "0")
  const remaining = parseFloat(budget.total_remaining || "0")
  const progress = parseFloat(budget.progress_percentage || "0")

  const isOverBudget = spent > budgetAmount
  const isActive = budget.is_active

  return (
    <Link
      href={`/app/budgets/${budget.id}`}
      className={`block ${!isActive ? "opacity-60" : ""}`}
    >
      <Card className="hover:bg-muted transition-colors">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg text-foreground">
                {budget.custom_name || "Monthly Budget"}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {format(new Date(budget.start_date), "MMM d")} -{" "}
                  {format(new Date(budget.end_date), "MMM d, yyyy")}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(budgetAmount)}
              </p>
              {budget.is_recurrent && (
                <span className="text-xs text-muted-foreground/70">Recurring</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {formatCurrency(spent)} spent
              </span>
              <span className={isOverBudget ? "text-destructive" : "text-muted-foreground"}>
                {formatCurrency(remaining)} remaining
              </span>
            </div>
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isOverBudget ? "bg-destructive" : "bg-info"}`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          {!isActive && (
            <div className="mt-3 text-xs text-muted-foreground/70">Inactive budget</div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

function BudgetSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32 bg-muted" />
            <Skeleton className="h-4 w-40 bg-muted" />
          </div>
          <Skeleton className="h-8 w-24 bg-muted" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20 bg-muted" />
            <Skeleton className="h-4 w-24 bg-muted" />
          </div>
          <Skeleton className="h-2 w-full bg-muted" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function BudgetsPage() {

  const { data: budgets, isLoading } = useBudgets()

  const activeBudgets = budgets?.filter((b) => b.is_active) || []
  const inactiveBudgets = budgets?.filter((b) => !b.is_active) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Budgets</h1>
          <p className="text-muted-foreground text-sm">
            Track your spending with monthly budgets
          </p>
        </div>
        <Button className="rounded-full" asChild>
          <Link href="/app/budgets/new">
            <Plus className="h-4 w-4" />
            New Budget
          </Link>
        </Button>
      </div>

      {/* Budgets List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <BudgetSkeleton key={i} />
          ))}
        </div>
      ) : budgets && budgets.length > 0 ? (
        <div className="space-y-8">
          {/* Active Budgets */}
          {activeBudgets.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                Active Budgets
              </h2>
              <div className="space-y-4">
                {activeBudgets.map((budget) => (
                  <BudgetItem key={budget.id} budget={budget} />
                ))}
              </div>
            </div>
          )}

          {/* Inactive Budgets */}
          {inactiveBudgets.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-muted-foreground">
                Past Budgets
              </h2>
              <div className="space-y-4">
                {inactiveBudgets.map((budget) => (
                  <BudgetItem key={budget.id} budget={budget} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <PiggyBank className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No budgets yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Create your first budget to start tracking your spending
            </p>
            <Button className="rounded-full" asChild>
              <Link href="/app/budgets/new">
                <Plus className="h-4 w-4" />
                Create Budget
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
