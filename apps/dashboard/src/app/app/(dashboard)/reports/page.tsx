"use client"

import { useState } from "react"
import { format, subMonths, addMonths } from "date-fns"
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
} from "recharts"

import {
  useIncomeExpenseReport,
  useExpenseByCategory,
} from "@/lib/api/hooks/use-reports"
import type { ReportGranularity } from "@/lib/api/types"
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
}: {
  title: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  trend?: "up" | "down" | "neutral"
}) {
  return (
    <div className="dash-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-dash-text-muted">{title}</p>
          <p className="text-2xl font-bold text-dash-text">
            {title === "Savings Rate"
              ? `${value.toFixed(1)}%`
              : formatCurrency(value)}
          </p>
        </div>
        <div
          className={cn(
            "p-3 rounded-full",
            trend === "up" && "bg-dash-success/10 text-dash-success",
            trend === "down" && "bg-dash-error/10 text-dash-error",
            trend === "neutral" && "bg-dash-card-hover text-dash-text-muted"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

function ReportsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32 bg-dash-card-hover" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 bg-dash-card-hover" />
          <Skeleton className="h-6 w-32 bg-dash-card-hover" />
          <Skeleton className="h-10 w-10 bg-dash-card-hover" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 bg-dash-card-hover" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-80 bg-dash-card-hover" />
        <Skeleton className="h-80 bg-dash-card-hover" />
      </div>
    </div>
  )
}

export default function ReportsPage() {
  // State for period navigation
  const [currentDate, setCurrentDate] = useState(new Date())
  const [granularity, setGranularity] = useState<ReportGranularity>("month")

  // Format the period date for API
  const periodDate = format(currentDate, "yyyy-MM-dd")

  // Fetch report data
  const { data: incomeExpenseReport, isLoading: isLoadingIncomeExpense } =
    useIncomeExpenseReport({ periodDate, granularity })

  const { data: expenseReport, isLoading: isLoadingExpense } =
    useExpenseByCategory({ periodDate })

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
        <h1 className="text-2xl font-semibold text-dash-text">Reports</h1>
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
      color: "hsl(160 84% 39%)",
    },
    expense: {
      label: "Expenses",
      color: "hsl(0 84% 60%)",
    },
  } satisfies ChartConfig

  // Chart config for expense categories (dynamic based on data)
  const expenseCategoryConfig = expenseCategories.reduce(
    (acc, category) => {
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
        <h1 className="text-2xl font-semibold text-dash-text">Reports</h1>

        <div className="flex items-center gap-4">
          {/* Granularity selector */}
          <Tabs
            value={granularity}
            onValueChange={(v) => setGranularity(v as ReportGranularity)}
          >
            <TabsList className="bg-dash-bg border border-dash-border rounded-lg p-1">
              <TabsTrigger
                value="week"
                className="rounded-md text-sm data-[state=active]:bg-dash-card data-[state=active]:text-dash-text text-dash-text-muted"
              >
                Week
              </TabsTrigger>
              <TabsTrigger
                value="month"
                className="rounded-md text-sm data-[state=active]:bg-dash-card data-[state=active]:text-dash-text text-dash-text-muted"
              >
                Month
              </TabsTrigger>
              <TabsTrigger
                value="year"
                className="rounded-md text-sm data-[state=active]:bg-dash-card data-[state=active]:text-dash-text text-dash-text-muted"
              >
                Year
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Period navigation */}
          <div className="flex items-center gap-2">
            <button onClick={goToPreviousPeriod} className="dash-btn-pill p-2">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[140px] text-center font-medium text-dash-text">
              {incomeExpenseReport?.period_label ||
                format(currentDate, "MMM yyyy")}
            </span>
            <button onClick={goToNextPeriod} className="dash-btn-pill p-2">
              <ChevronRight className="h-4 w-4" />
            </button>
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
          trend={(summary?.total_balance || 0) >= 0 ? "up" : "down"}
        />
        <SummaryCard
          title="Savings Rate"
          value={(summary?.net_savings_rate || 0) * 100}
          icon={PiggyBank}
          trend="neutral"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expense Bar Chart */}
        <div className="dash-card p-6">
          <h2 className="text-lg font-medium text-dash-text mb-2">
            Income vs Expenses
          </h2>
          <p className="text-sm text-dash-text-muted mb-4">
            Comparing income and expenses over time
          </p>
          {timeSeries.length > 0 ? (
            <ChartContainer
              config={incomeExpenseConfig}
              className="min-h-[300px] w-full"
            >
              <BarChart accessibilityLayer data={timeSeries}>
                <CartesianGrid vertical={false} stroke="hsl(214 14% 20%)" />
                <XAxis
                  dataKey="period_label"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tick={{ fill: "hsl(218 11% 65%)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                  tick={{ fill: "hsl(218 11% 65%)" }}
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
            <div className="h-[300px] flex items-center justify-center text-dash-text-muted">
              No data for this period
            </div>
          )}
        </div>

        {/* Expense by Category Pie Chart */}
        <div className="dash-card p-6">
          <h2 className="text-lg font-medium text-dash-text mb-2">
            Expenses by Category
          </h2>
          <p className="text-sm text-dash-text-muted mb-4">
            Breakdown of spending by category
          </p>
          {expenseCategories.length > 0 ? (
            <ChartContainer
              config={expenseCategoryConfig}
              className="min-h-[300px] w-full"
            >
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
                      stroke="hsl(210 22% 8%)"
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-dash-text-muted">
              No expenses for this period
            </div>
          )}
        </div>
      </div>

      {/* Category breakdown list */}
      <div className="dash-card p-6">
        <h2 className="text-lg font-medium text-dash-text mb-4">
          Category Breakdown
        </h2>
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
                    <span className="font-medium text-dash-text-secondary truncate">
                      {category.name}
                    </span>
                    <span className="text-sm text-dash-text-muted">
                      {formatCurrency(category.amount)}
                    </span>
                  </div>
                  <div className="h-2 bg-dash-border rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${category.percentage * 100}%`,
                        backgroundColor: category.bar_color,
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-dash-text-muted w-16 text-right">
                  {formatPercentage(category.percentage)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-dash-text-muted py-8">
            No expense data for this period
          </p>
        )}
      </div>
    </div>
  )
}
