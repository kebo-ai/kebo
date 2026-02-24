"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Tags, ArrowDownCircle, ArrowUpCircle } from "lucide-react"

import { useCategories } from "@/lib/api/hooks/use-categories"
import type { Category, TransactionType } from "@/lib/api/types"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function CategoryItem({
  category,
}: {
  category: Category
}) {
  return (
    <Link
      href={`/app/categories/${category.id}`}
      className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-lg">
        {category.icon_emoji || (category.type === "Expense" ? "💸" : "💰")}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-foreground font-medium truncate">
          {category.name}
        </p>
        <p className="text-sm text-muted-foreground/70">{category.type}</p>
      </div>
      <div
        className={`px-2 py-1 text-xs rounded-full ${
          category.type === "Expense"
            ? "bg-destructive/10 text-destructive"
            : "bg-success/10 text-success"
        }`}
      >
        {category.type}
      </div>
    </Link>
  )
}

function CategorySkeleton() {
  return (
    <div className="flex items-center gap-4 px-3 py-3">
      <Skeleton className="h-10 w-10 rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32 bg-muted" />
        <Skeleton className="h-3 w-20 bg-muted" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full bg-muted" />
    </div>
  )
}

function CategoryList({
  categories,
  isLoading,
  type,
}: {
  categories: Category[] | undefined
  isLoading: boolean
  type: TransactionType
}) {
  const filteredCategories = categories?.filter(
    (cat) => cat.type === type && cat.is_visible && !cat.is_deleted
  )

  if (isLoading) {
    return (
      <div className="divide-y divide-border">
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
        <Button className="rounded-full" asChild>
          <Link href={`/app/categories/new?type=${type}`}>
            <Plus className="h-4 w-4" />
            Add {type} Category
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border">
      {filteredCategories.map((category) => (
        <CategoryItem key={category.id} category={category} />
      ))}
    </div>
  )
}

export default function CategoriesPage() {

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Categories</h1>
          <p className="text-muted-foreground text-sm">
            Organize your transactions with categories
          </p>
        </div>
        <Button className="rounded-full" asChild>
          <Link href={`/app/categories/new?type=${activeTab}`}>
            <Plus className="h-4 w-4" />
            New Category
          </Link>
        </Button>
      </div>

      {/* Categories with Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as TransactionType)}
          >
            <div className="p-4 border-b border-border">
              <TabsList className="grid w-full grid-cols-2 bg-background border border-border rounded-lg p-1">
                <TabsTrigger
                  value="Expense"
                  className="flex items-center gap-2 rounded-md text-sm data-[state=active]:bg-card data-[state=active]:text-foreground text-muted-foreground"
                >
                  <ArrowDownCircle className="h-4 w-4" />
                  Expenses
                  {!isLoading && (
                    <span className="ml-1 text-xs text-muted-foreground/70">
                      ({expenseCount})
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="Income"
                  className="flex items-center gap-2 rounded-md text-sm data-[state=active]:bg-card data-[state=active]:text-foreground text-muted-foreground"
                >
                  <ArrowUpCircle className="h-4 w-4" />
                  Income
                  {!isLoading && (
                    <span className="ml-1 text-xs text-muted-foreground/70">
                      ({incomeCount})
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="Expense" className="m-0">
              <CategoryList
                categories={categories}
                isLoading={isLoading}
                type="Expense"
              />
            </TabsContent>
            <TabsContent value="Income" className="m-0">
              <CategoryList
                categories={categories}
                isLoading={isLoading}
                type="Income"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
