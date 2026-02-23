"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

import { useBudget, useUpdateBudget } from "@/lib/api/hooks/use-budgets"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BudgetForm,
  type BudgetFormData,
} from "@/components/app/budgets/BudgetForm"

function EditBudgetSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-8 w-48" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default function EditBudgetPage() {
  const params = useParams()
  const router = useRouter()
  const lang = params.lang as string
  const id = params.id as string

  const { data: budget, isLoading, error } = useBudget(id)
  const updateBudget = useUpdateBudget()

  const handleSubmit = async (data: BudgetFormData) => {
    try {
      await updateBudget.mutateAsync({
        id,
        data: {
          custom_name: data.custom_name || undefined,
          budget_amount: parseFloat(data.budget_amount),
          start_date: format(data.start_date, "yyyy-MM-dd"),
          end_date: format(data.end_date, "yyyy-MM-dd"),
          is_recurrent: data.is_recurrent,
          budget_lines: data.budget_lines.map((line) => ({
            category_id: line.category_id,
            amount: parseFloat(line.amount),
          })),
        },
      })

      toast.success("Budget updated successfully!")
      router.push(`/${lang}/app/budgets/${id}`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update budget"
      )
    }
  }

  const handleCancel = () => {
    router.push(`/${lang}/app/budgets/${id}`)
  }

  if (isLoading) {
    return <EditBudgetSkeleton />
  }

  if (error || !budget) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/${lang}/app/budgets`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Budget Not Found</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              The budget you are trying to edit does not exist.
            </p>
            <Button asChild>
              <Link href={`/${lang}/app/budgets`}>Back to Budgets</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/${lang}/app/budgets/${id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Budget</h1>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Details</CardTitle>
        </CardHeader>
        <CardContent>
          <BudgetForm
            initialData={budget}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={updateBudget.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}
