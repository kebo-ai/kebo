"use client"

import { useBalance } from "@/lib/api/hooks"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  BarChart3,
  CheckCircle,
} from "lucide-react"
import { useState } from "react"

function formatBalanceDisplay(amount: number) {
  const parts = amount.toFixed(2).split(".")
  const dollars = new Intl.NumberFormat("en-US").format(parseInt(parts[0]))
  const cents = parts[1]
  return { dollars, cents }
}

export function BalanceCard() {
  const { data: balance, isLoading } = useBalance()
  const [showBalance, setShowBalance] = useState(true)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
          <Skeleton className="h-10 w-48 mb-4" />
          <Skeleton className="h-4 w-40" />
        </CardContent>
      </Card>
    )
  }

  const balanceAmount = parseFloat(balance?.total_balance ?? "0")
  const { dollars, cents } = formatBalanceDisplay(balanceAmount)

  return (
    <Card>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              Kebo balance
            </span>
            <CheckCircle className="h-4 w-4 text-success" />
          </div>
          <div className="flex gap-1">
            <button className="p-2 rounded-lg bg-muted hover:bg-border transition-colors">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setShowBalance(!showBalance)}
            >
              {showBalance ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Balance Amount */}
        <div className="mb-4">
          {showBalance ? (
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-foreground">
                ${dollars}
              </span>
              <span className="text-xl font-bold text-muted-foreground">
                .{cents}
              </span>
            </div>
          ) : (
            <div className="text-4xl font-bold text-foreground">$****.**</div>
          )}
        </div>

        {/* Period Stats */}
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">Last 30 days</span>
          <div className="flex items-center gap-1 text-success">
            <TrendingUp className="h-3 w-3" />
            <span>$0</span>
          </div>
          <div className="flex items-center gap-1 text-destructive">
            <TrendingDown className="h-3 w-3" />
            <span>-$0</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
