"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { Plus, PiggyBank, Calendar, TrendingUp } from "lucide-react"

import { useBudgets } from "@/lib/api/hooks/use-budgets"
import type { Budget } from "@/lib/api/types"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

function formatCurrency(amount: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

function BudgetItem({ budget, lang }: { budget: Budget; lang: string }) {
  const budgetAmount = parseFloat(budget.budget_amount || "0")
  const spent = parseFloat(budget.total_spent || "0")
  const remaining = parseFloat(budget.total_remaining || "0")
  const progress = parseFloat(budget.progress_percentage || "0")

  const isOverBudget = spent > budgetAmount
  const isActive = budget.is_active

  return (
    <Link
      href={`/${lang}/app/budgets/${budget.id}`}
      className="block hover:bg-accent/50 rounded-lg transition-colors"
    >
      <Card className={!isActive ? "opacity-60" : ""}>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">
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
              <p className="text-2xl font-bold">
                {formatCurrency(budgetAmount)}
              </p>
              {budget.is_recurrent && (
                <span className="text-xs text-muted-foreground">Recurring</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {formatCurrency(spent)} spent
              </span>
              <span
                className={
                  isOverBudget ? "text-red-500" : "text-muted-foreground"
                }
              >
                {formatCurrency(remaining)} remaining
              </span>
            </div>
            <Progress
              value={Math.min(progress, 100)}
              className={isOverBudget ? "[&>div]:bg-red-500" : ""}
            />
          </div>

          {!isActive && (
            <div className="mt-3 text-xs text-muted-foreground">
              Inactive budget
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

function BudgetSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function BudgetsPage() {
  const params = useParams()
  const lang = params.lang as string

  const { data: budgets, isLoading } = useBudgets()

  const activeBudgets = budgets?.filter((b) => b.is_active) || []
  const inactiveBudgets = budgets?.filter((b) => !b.is_active) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Budgets</h1>
          <p className="text-muted-foreground">
            Track your spending with monthly budgets
          </p>
        </div>
        <Button asChild>
          <Link href={`/${lang}/app/budgets/new`}>
            <Plus className="mr-2 h-4 w-4" />
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
        <div className="space-y-6">
          {/* Active Budgets */}
          {activeBudgets.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Active Budgets
              </h2>
              <div className="space-y-4">
                {activeBudgets.map((budget) => (
                  <BudgetItem key={budget.id} budget={budget} lang={lang} />
                ))}
              </div>
            </div>
          )}

          {/* Inactive Budgets */}
          {inactiveBudgets.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-muted-foreground">
                Past Budgets
              </h2>
              <div className="space-y-4">
                {inactiveBudgets.map((budget) => (
                  <BudgetItem key={budget.id} budget={budget} lang={lang} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <PiggyBank className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No budgets yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first budget to start tracking your spending
            </p>
            <Button asChild>
              <Link href={`/${lang}/app/budgets/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Create Budget
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
