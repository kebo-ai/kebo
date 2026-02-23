"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

import { useCreateBudget } from "@/lib/api/hooks/use-budgets"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BudgetForm,
  type BudgetFormData,
} from "@/components/app/budgets/BudgetForm"

export default function NewBudgetPage() {
  const router = useRouter()

  const createBudget = useCreateBudget()

  const handleSubmit = async (data: BudgetFormData) => {
    try {
      await createBudget.mutateAsync({
        custom_name: data.custom_name || undefined,
        budget_amount: parseFloat(data.budget_amount),
        start_date: format(data.start_date, "yyyy-MM-dd"),
        end_date: format(data.end_date, "yyyy-MM-dd"),
        is_recurrent: data.is_recurrent,
        budget_lines: data.budget_lines.map((line) => ({
          category_id: line.category_id,
          amount: parseFloat(line.amount),
        })),
      })

      toast.success("Budget created successfully!")
      router.push(`/app/budgets`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create budget"
      )
    }
  }

  const handleCancel = () => {
    router.push(`/app/budgets`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/app/budgets`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">New Budget</h1>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Details</CardTitle>
        </CardHeader>
        <CardContent>
          <BudgetForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={createBudget.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}
