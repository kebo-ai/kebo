"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Tags,
  Loader2,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react"
import { toast } from "sonner"

import {
  useCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/lib/api/hooks/use-categories"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  CategoryForm,
  type CategoryFormData,
} from "@/components/category-form"

function DetailRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex justify-between py-3 border-b last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  )
}

function CategoryDetailSkeleton() {
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
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex justify-between py-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-32" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default function CategoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { data: category, isLoading, error } = useCategory(id)
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const isUpdating = updateCategory.isPending
  const isDeleting = deleteCategory.isPending

  const handleUpdate = async (data: CategoryFormData) => {
    try {
      await updateCategory.mutateAsync({
        id,
        data: {
          name: data.name,
          type: data.type,
          icon_emoji: data.icon_emoji || undefined,
        },
      })

      toast.success("Category updated successfully!")
      setIsEditing(false)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update category"
      )
    }
  }

  const handleDelete = async () => {
    try {
      await deleteCategory.mutateAsync(id)
      toast.success("Category deleted successfully!")
      router.push(`/app/categories`)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete category"
      )
    }
  }

  if (isLoading) {
    return <CategoryDetailSkeleton />
  }

  if (error || !category) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/app/categories`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Category Not Found</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              The category you are looking for does not exist or has been
              deleted.
            </p>
            <Button asChild>
              <Link href={`/app/categories`}>Back to Categories</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(false)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Edit Category</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Category Details</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryForm
              initialData={category}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditing(false)}
              isLoading={isUpdating}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/app/categories`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Category Details</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
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
                <AlertDialogTitle>Delete Category</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this category? Transactions
                  using this category will become uncategorized. This action
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

      {/* Category Summary Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-2xl">
              {category.icon_emoji ||
                (category.type === "Expense" ? "💸" : "💰")}
            </div>
            <div className="flex-1">
              <p className="text-lg font-semibold">{category.name}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {category.type === "Expense" ? (
                  <ArrowDownCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <ArrowUpCircle className="h-4 w-4 text-green-500" />
                )}
                <span>{category.type} Category</span>
              </div>
            </div>
            <div
              className={`px-3 py-1.5 text-sm rounded-full ${
                category.type === "Expense"
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              }`}
            >
              {category.type}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <DetailRow label="Name" value={category.name} />
          <DetailRow label="Type" value={category.type} />
          <DetailRow
            label="Icon"
            value={
              category.icon_emoji ? (
                <span className="text-xl">{category.icon_emoji}</span>
              ) : (
                <span className="text-muted-foreground">None</span>
              )
            }
          />
          <DetailRow
            label="Visible"
            value={category.is_visible ? "Yes" : "No"}
          />
        </CardContent>
      </Card>
    </div>
  )
}
