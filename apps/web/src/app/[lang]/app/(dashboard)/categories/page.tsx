"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Plus, Tags, ArrowDownCircle, ArrowUpCircle } from "lucide-react"

import { useCategories } from "@/lib/api/hooks/use-categories"
import type { Category, TransactionType } from "@/lib/api/types"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function CategoryItem({
  category,
  lang,
}: {
  category: Category
  lang: string
}) {
  return (
    <Link
      href={`/${lang}/app/categories/${category.id}`}
      className="flex items-center gap-4 p-4 hover:bg-accent rounded-lg transition-colors"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-lg">
        {category.icon_emoji || (category.type === "Expense" ? "💸" : "💰")}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{category.name}</p>
        <p className="text-sm text-muted-foreground">{category.type}</p>
      </div>
      <div
        className={`px-2 py-1 text-xs rounded-full ${
          category.type === "Expense"
            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
        }`}
      >
        {category.type}
      </div>
    </Link>
  )
}

function CategorySkeleton() {
  return (
    <div className="flex items-center gap-4 p-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  )
}

function CategoryList({
  categories,
  isLoading,
  lang,
  type,
}: {
  categories: Category[] | undefined
  isLoading: boolean
  lang: string
  type: TransactionType
}) {
  const filteredCategories = categories?.filter(
    (cat) => cat.type === type && cat.is_visible && !cat.is_deleted
  )

  if (isLoading) {
    return (
      <div className="divide-y">
        {[...Array(4)].map((_, i) => (
          <CategorySkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!filteredCategories || filteredCategories.length === 0) {
    return (
      <div className="text-center py-12">
        <Tags className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4">
          No {type.toLowerCase()} categories yet
        </p>
        <Button asChild>
          <Link href={`/${lang}/app/categories/new?type=${type}`}>
            <Plus className="mr-2 h-4 w-4" />
            Add {type} Category
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="divide-y">
      {filteredCategories.map((category) => (
        <CategoryItem key={category.id} category={category} lang={lang} />
      ))}
    </div>
  )
}

export default function CategoriesPage() {
  const params = useParams()
  const lang = params.lang as string

  const [activeTab, setActiveTab] = useState<TransactionType>("Expense")

  const { data: categories, isLoading } = useCategories()

  const expenseCount =
    categories?.filter(
      (c) => c.type === "Expense" && c.is_visible && !c.is_deleted
    ).length || 0
  const incomeCount =
    categories?.filter(
      (c) => c.type === "Income" && c.is_visible && !c.is_deleted
    ).length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-muted-foreground">
            Organize your transactions with categories
          </p>
        </div>
        <Button asChild>
          <Link href={`/${lang}/app/categories/new?type=${activeTab}`}>
            <Plus className="mr-2 h-4 w-4" />
            New Category
          </Link>
        </Button>
      </div>

      {/* Categories with Tabs */}
      <Card>
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TransactionType)}
        >
          <CardHeader className="pb-0">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="Expense" className="flex items-center gap-2">
                <ArrowDownCircle className="h-4 w-4" />
                Expenses
                {!isLoading && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({expenseCount})
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="Income" className="flex items-center gap-2">
                <ArrowUpCircle className="h-4 w-4" />
                Income
                {!isLoading && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({incomeCount})
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <TabsContent value="Expense" className="m-0">
              <CategoryList
                categories={categories}
                isLoading={isLoading}
                lang={lang}
                type="Expense"
              />
            </TabsContent>
            <TabsContent value="Income" className="m-0">
              <CategoryList
                categories={categories}
                isLoading={isLoading}
                lang={lang}
                type="Income"
              />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  )
}
