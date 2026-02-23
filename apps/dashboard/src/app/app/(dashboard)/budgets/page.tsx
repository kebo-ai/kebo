"use client"

import Link from "next/link"
import { format } from "date-fns"
import { Plus, PiggyBank, Calendar, TrendingUp } from "lucide-react"

import { useBudgets } from "@/lib/api/hooks/use-budgets"
import type { Budget } from "@/lib/api/types"

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
      className={`block dash-card p-6 hover:bg-dash-card-hover transition-colors ${!isActive ? "opacity-60" : ""}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg text-dash-text">
            {budget.custom_name || "Monthly Budget"}
          </h3>
          <div className="flex items-center gap-2 text-sm text-dash-text-muted mt-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {format(new Date(budget.start_date), "MMM d")} -{" "}
              {format(new Date(budget.end_date), "MMM d, yyyy")}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-dash-text">
            {formatCurrency(budgetAmount)}
          </p>
          {budget.is_recurrent && (
            <span className="text-xs text-dash-text-dim">Recurring</span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-dash-text-muted">
            {formatCurrency(spent)} spent
          </span>
          <span className={isOverBudget ? "text-dash-error" : "text-dash-text-muted"}>
            {formatCurrency(remaining)} remaining
          </span>
        </div>
        <div className="h-2 bg-dash-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isOverBudget ? "bg-dash-error" : "bg-dash-accent"}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {!isActive && (
        <div className="mt-3 text-xs text-dash-text-dim">Inactive budget</div>
      )}
    </Link>
  )
}

function BudgetSkeleton() {
  return (
    <div className="dash-card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32 bg-dash-card-hover" />
          <Skeleton className="h-4 w-40 bg-dash-card-hover" />
        </div>
        <Skeleton className="h-8 w-24 bg-dash-card-hover" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20 bg-dash-card-hover" />
          <Skeleton className="h-4 w-24 bg-dash-card-hover" />
        </div>
        <Skeleton className="h-2 w-full bg-dash-card-hover" />
      </div>
    </div>
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
          <h1 className="text-2xl font-semibold text-dash-text">Budgets</h1>
          <p className="text-dash-text-muted text-sm">
            Track your spending with monthly budgets
          </p>
        </div>
        <Link href="/app/budgets/new" className="dash-btn-pill-primary">
          <Plus className="h-4 w-4" />
          New Budget
        </Link>
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
              <h2 className="text-lg font-medium text-dash-text flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-dash-success" />
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
              <h2 className="text-lg font-medium text-dash-text-muted">
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
        <div className="dash-card py-12 text-center">
          <PiggyBank className="h-12 w-12 mx-auto text-dash-text-muted mb-4" />
          <h3 className="text-lg font-medium text-dash-text mb-2">
            No budgets yet
          </h3>
          <p className="text-dash-text-muted mb-4">
            Create your first budget to start tracking your spending
          </p>
          <Link href="/app/budgets/new" className="dash-btn-pill-primary">
            <Plus className="h-4 w-4" />
            Create Budget
          </Link>
        </div>
      )}
    </div>
  )
}
