"use client"

import { useAuth } from "@/lib/auth/hooks"
import { BalanceCard } from "@/components/balance-card"
import { QuickActions } from "@/components/quick-actions"
import { AccountsPanel } from "@/components/accounts-panel"
import { RecentTransactions } from "@/components/recent-transactions"
import { KeboWiseCard } from "@/components/kebo-wise-card"

export default function DashboardPage() {
  const { user } = useAuth()

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "there"

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-foreground">
          Welcome, {firstName}
        </h1>
        <QuickActions />
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Balance & Transactions */}
        <div className="lg:col-span-2 space-y-6">
          <BalanceCard />
          <RecentTransactions />
        </div>

        {/* Right Column - Accounts & Kebo Wise */}
        <div className="space-y-6">
          <AccountsPanel />
          <KeboWiseCard />
        </div>
      </div>
    </div>
  )
}
