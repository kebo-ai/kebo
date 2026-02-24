"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Calendar,
  Loader2,
  PiggyBank,
} from "lucide-react"
import { toast } from "sonner"

import { useBudget, useDeleteBudget } from "@/lib/api/hooks/use-budgets"
import type { BudgetLine } from "@/lib/api/types"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

function formatCurrency(amount: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

function BudgetLineItem({ line }: { line: BudgetLine }) {
  const spent = parseFloat(line.spent_amount || "0")
  const progress = parseFloat(line.progress_percentage || "0")
  const amount = parseFloat(line.amount)
  const remaining = parseFloat(line.remaining_amount || "0")
  const isOverBudget = spent > amount

  return (
    <div className="py-4 border-b last:border-b-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-lg">
            {line.icon_emoji || "📁"}
          </div>
          <div>
            <p className="font-medium">{line.category_name || "Category"}</p>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(spent)} of {formatCurrency(amount)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p
            className={`font-semibold ${isOverBudget ? "text-red-500" : "text-green-600"}`}
          >
            {isOverBudget ? "-" : ""}
            {formatCurrency(Math.abs(remaining))}
          </p>
          <p className="text-xs text-muted-foreground">
            {isOverBudget ? "over budget" : "remaining"}
          </p>
        </div>
      </div>
      <Progress
        value={Math.min(progress, 100)}
        className={isOverBudget ? "[&>div]:bg-red-500" : ""}
      />
    </div>
  )
}

function BudgetDetailSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-8 w-48" />
      </div>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-2 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-2 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default function BudgetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { data: budget, isLoading, error } = useBudget(id)
  const deleteBudget = useDeleteBudget()

  const isDeleting = deleteBudget.isPending

  const handleDelete = async () => {
    try {
      await deleteBudget.mutateAsync(id)
      toast.success("Budget deleted successfully!")
      router.push(`/budgets`)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete budget"
      )
    }
  }

  if (isLoading) {
    return <BudgetDetailSkeleton />
  }

  if (error || !budget) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/budgets`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Budget Not Found</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              The budget you are looking for does not exist or has been deleted.
            </p>
            <Button asChild>
              <Link href={`/budgets`}>Back to Budgets</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalMetrics = budget.total_metrics || {
    total_budget: budget.budget_amount,
    total_spent: "0",
    total_remaining: budget.budget_amount,
    overall_progress_percentage: "0",
  }

  const totalSpent = parseFloat(totalMetrics.total_spent)
  const totalBudget = parseFloat(totalMetrics.total_budget)
  const totalRemaining = parseFloat(totalMetrics.total_remaining)
  const progressPercentage = parseFloat(totalMetrics.overall_progress_percentage)

  const isOverBudget = totalSpent > totalBudget

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/budgets`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Budget Details</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/budgets/${id}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Budget</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this budget? This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Budget Overview Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">
                {budget.custom_name || "Monthly Budget"}
              </h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(budget.start_date), "MMM d")} -{" "}
                  {format(new Date(budget.end_date), "MMM d, yyyy")}
                </span>
                {budget.is_recurrent && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded text-xs">
                    Recurring
                  </span>
                )}
                {!budget.is_active && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 rounded text-xs">
                    Inactive
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Total Progress */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-3xl font-bold">
                  {formatCurrency(totalSpent)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Budget</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(totalBudget)}
                </p>
              </div>
            </div>

            <Progress
              value={Math.min(progressPercentage, 100)}
              className={`h-3 ${isOverBudget ? "[&>div]:bg-red-500" : ""}`}
            />

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {progressPercentage.toFixed(0)}% used
              </span>
              <span
                className={isOverBudget ? "text-red-500" : "text-green-600"}
              >
                {isOverBudget ? "Over by " : ""}
                {formatCurrency(Math.abs(totalRemaining))}{" "}
                {isOverBudget ? "" : "remaining"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown Card */}
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {budget.budget_lines && budget.budget_lines.length > 0 ? (
            <div>
              {budget.budget_lines.map((line) => (
                <BudgetLineItem key={line.id} line={line} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <PiggyBank className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No category allocations yet
              </p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href={`/budgets/${id}/edit`}>
                  Add Categories
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
