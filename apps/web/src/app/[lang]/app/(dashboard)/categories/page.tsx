"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Plus, Tags, ArrowDownCircle, ArrowUpCircle } from "lucide-react"

import { useCategories } from "@/lib/api/hooks/use-categories"
import type { Category, TransactionType } from "@/lib/api/types"

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
      className="dash-list-item"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-dash-card-hover text-lg">
        {category.icon_emoji || (category.type === "Expense" ? "💸" : "💰")}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-dash-text-secondary font-medium truncate">
          {category.name}
        </p>
        <p className="text-sm text-dash-text-dim">{category.type}</p>
      </div>
      <div
        className={`px-2 py-1 text-xs rounded-full ${
          category.type === "Expense"
            ? "bg-dash-error/10 text-dash-error"
            : "bg-dash-success/10 text-dash-success"
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
      <Skeleton className="h-10 w-10 rounded-full bg-dash-card-hover" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32 bg-dash-card-hover" />
        <Skeleton className="h-3 w-20 bg-dash-card-hover" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full bg-dash-card-hover" />
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
      <div className="divide-y divide-dash-border">
        {[...Array(4)].map((_, i) => (
          <CategorySkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!filteredCategories || filteredCategories.length === 0) {
    return (
      <div className="text-center py-12">
        <Tags className="h-12 w-12 mx-auto text-dash-text-muted mb-4" />
        <p className="text-dash-text-muted mb-4">
          No {type.toLowerCase()} categories yet
        </p>
        <Link
          href={`/${lang}/app/categories/new?type=${type}`}
          className="dash-btn-pill-primary"
        >
          <Plus className="h-4 w-4" />
          Add {type} Category
        </Link>
      </div>
    )
  }

  return (
    <div className="divide-y divide-dash-border">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-dash-text">Categories</h1>
          <p className="text-dash-text-muted text-sm">
            Organize your transactions with categories
          </p>
        </div>
        <Link
          href={`/${lang}/app/categories/new?type=${activeTab}`}
          className="dash-btn-pill-primary"
        >
          <Plus className="h-4 w-4" />
          New Category
        </Link>
      </div>

      {/* Categories with Tabs */}
      <div className="dash-card">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TransactionType)}
        >
          <div className="p-4 border-b border-dash-border">
            <TabsList className="grid w-full grid-cols-2 bg-dash-bg border border-dash-border rounded-lg p-1">
              <TabsTrigger
                value="Expense"
                className="flex items-center gap-2 rounded-md text-sm data-[state=active]:bg-dash-card data-[state=active]:text-dash-text text-dash-text-muted"
              >
                <ArrowDownCircle className="h-4 w-4" />
                Expenses
                {!isLoading && (
                  <span className="ml-1 text-xs text-dash-text-dim">
                    ({expenseCount})
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="Income"
                className="flex items-center gap-2 rounded-md text-sm data-[state=active]:bg-dash-card data-[state=active]:text-dash-text text-dash-text-muted"
              >
                <ArrowUpCircle className="h-4 w-4" />
                Income
                {!isLoading && (
                  <span className="ml-1 text-xs text-dash-text-dim">
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
        </Tabs>
      </div>
    </div>
  )
}
