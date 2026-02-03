"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { format, subMonths, addMonths } from "date-fns"
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell } from "recharts"

import { useIncomeExpenseReport, useExpenseByCategory } from "@/lib/api/hooks/use-reports"
import type { ReportGranularity } from "@/lib/api/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  trend,
  className,
}: {
  title: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  trend?: "up" | "down" | "neutral"
  className?: string
}) {
  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{formatCurrency(value)}</p>
          </div>
          <div
            className={cn(
              "p-3 rounded-full",
              trend === "up" && "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
              trend === "down" && "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
              trend === "neutral" && "bg-muted text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ReportsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  )
}

export default function ReportsPage() {
  const params = useParams()
  const lang = params.lang as string

  // State for period navigation
  const [currentDate, setCurrentDate] = useState(new Date())
  const [granularity, setGranularity] = useState<ReportGranularity>("month")

  // Format the period date for API
  const periodDate = format(currentDate, "yyyy-MM-dd")

  // Fetch report data
  const {
    data: incomeExpenseReport,
    isLoading: isLoadingIncomeExpense,
  } = useIncomeExpenseReport({ periodDate, granularity })

  const {
    data: expenseReport,
    isLoading: isLoadingExpense,
  } = useExpenseByCategory({ periodDate })

  const isLoading = isLoadingIncomeExpense || isLoadingExpense

  // Navigation handlers
  const goToPreviousPeriod = () => {
    if (granularity === "year") {
      setCurrentDate((d) => new Date(d.getFullYear() - 1, d.getMonth(), 1))
    } else if (granularity === "month") {
      setCurrentDate((d) => subMonths(d, 1))
    } else {
      setCurrentDate((d) => new Date(d.getTime() - 7 * 24 * 60 * 60 * 1000))
    }
  }

  const goToNextPeriod = () => {
    if (granularity === "year") {
      setCurrentDate((d) => new Date(d.getFullYear() + 1, d.getMonth(), 1))
    } else if (granularity === "month") {
      setCurrentDate((d) => addMonths(d, 1))
    } else {
      setCurrentDate((d) => new Date(d.getTime() + 7 * 24 * 60 * 60 * 1000))
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <ReportsSkeleton />
      </div>
    )
  }

  const summary = incomeExpenseReport?.summary
  const timeSeries = incomeExpenseReport?.time_series || []
  const expenseCategories = expenseReport?.data_categories || []

  // Chart config for income vs expense
  const incomeExpenseConfig = {
    income: {
      label: "Income",
      color: "hsl(var(--chart-1))",
    },
    expense: {
      label: "Expenses",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig

  // Chart config for expense categories (dynamic based on data)
  const expenseCategoryConfig = expenseCategories.reduce(
    (acc, category, index) => {
      acc[category.name] = {
        label: category.name,
        color: category.bar_color,
      }
      return acc
    },
    {} as ChartConfig
  )

  return (
    <div className="space-y-6">
      {/* Header with period navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Reports</h1>

        <div className="flex items-center gap-4">
          {/* Granularity selector */}
          <Tabs
            value={granularity}
            onValueChange={(v) => setGranularity(v as ReportGranularity)}
          >
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Period navigation */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPreviousPeriod}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[140px] text-center font-medium">
              {incomeExpenseReport?.period_label || format(currentDate, "MMM yyyy")}
            </span>
            <Button variant="outline" size="icon" onClick={goToNextPeriod}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Income"
          value={summary?.total_income || 0}
          icon={TrendingUp}
          trend="up"
        />
        <SummaryCard
          title="Total Expenses"
          value={summary?.total_expenses || 0}
          icon={TrendingDown}
          trend="down"
        />
        <SummaryCard
          title="Net Balance"
          value={summary?.total_balance || 0}
          icon={Wallet}
          trend={
            (summary?.total_balance || 0) >= 0 ? "up" : "down"
          }
        />
        <SummaryCard
          title="Savings Rate"
          value={(summary?.net_savings_rate || 0) * 100}
          icon={PiggyBank}
          trend="neutral"
          className="[&_p:last-child]:after:content-['%']"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expense Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
            <CardDescription>
              Comparing income and expenses over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {timeSeries.length > 0 ? (
              <ChartContainer config={incomeExpenseConfig} className="min-h-[300px] w-full">
                <BarChart accessibilityLayer data={timeSeries}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="period_label"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => (
                          <div className="flex items-center justify-between gap-2">
                            <span>{name}</span>
                            <span className="font-mono font-medium">
                              {formatCurrency(Number(value))}
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="income"
                    fill="var(--color-income)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="expense"
                    fill="var(--color-expense)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data for this period
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense by Category Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
            <CardDescription>
              Breakdown of spending by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            {expenseCategories.length > 0 ? (
              <ChartContainer config={expenseCategoryConfig} className="min-h-[300px] w-full">
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => (
                          <div className="flex items-center justify-between gap-2">
                            <span>{name}</span>
                            <span className="font-mono font-medium">
                              {formatCurrency(Number(value))}
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Pie
                    data={expenseCategories}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    strokeWidth={2}
                  >
                    {expenseCategories.map((entry) => (
                      <Cell
                        key={entry.id}
                        fill={entry.bar_color}
                        stroke="hsl(var(--background))"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No expenses for this period
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category breakdown list */}
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {expenseCategories.length > 0 ? (
            <div className="space-y-4">
              {expenseCategories.map((category) => (
                <div key={category.id} className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                    style={{ backgroundColor: category.bar_color + "20" }}
                  >
                    {category.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium truncate">{category.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(category.amount)}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${category.percentage * 100}%`,
                          backgroundColor: category.bar_color,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium w-16 text-right">
                    {formatPercentage(category.percentage)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No expense data for this period
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
