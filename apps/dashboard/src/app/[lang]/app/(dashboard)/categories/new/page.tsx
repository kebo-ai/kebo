"use client"

import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

import { useCreateCategory } from "@/lib/api/hooks/use-categories"
import type { TransactionType } from "@/lib/api/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CategoryForm,
  type CategoryFormData,
} from "@/components/app/categories/CategoryForm"

export default function NewCategoryPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const lang = params.lang as string

  const initialType = (searchParams.get("type") as TransactionType) || "Expense"

  const createCategory = useCreateCategory()

  const handleSubmit = async (data: CategoryFormData) => {
    try {
      await createCategory.mutateAsync({
        name: data.name,
        type: data.type,
        icon_emoji: data.icon_emoji || undefined,
      })

      toast.success("Category created successfully!")
      router.push(`/${lang}/app/categories`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create category"
      )
    }
  }

  const handleCancel = () => {
    router.push(`/${lang}/app/categories`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/${lang}/app/categories`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">New Category</h1>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryForm
            initialType={initialType}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={createCategory.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}
