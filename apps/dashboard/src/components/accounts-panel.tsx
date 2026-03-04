"use client"

import { useAccounts } from "@/lib/api/hooks"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { resolveStorageUrl } from "@/lib/utils"

const basePath = ""

function getAvatarColor(_index: number) {
  return "bg-muted text-muted-foreground"
}

function formatCurrency(amount: number | string) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  const parts = num.toFixed(2).split(".")
  const dollars = new Intl.NumberFormat("en-US").format(parseInt(parts[0]))
  const cents = parts[1]
  return { dollars, cents }
}

export function AccountsPanel() {
  const { data: accounts, isLoading } = useAccounts()

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium text-foreground">Accounts</span>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-6 w-6 rounded" />
            </div>
          </div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16 ml-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const accountsList = accounts?.slice(0, 5) || []

  return (
    <Card>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium text-foreground">Accounts</span>
          <div className="flex gap-1">
            <Link
              href={`${basePath}/accounts/new`}
              className="p-1.5 rounded hover:bg-muted transition-colors"
            >
              <Plus className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </div>

        {/* Account List */}
        <div className="space-y-1">
          {accountsList.length > 0 ? (
            accountsList.map((account, index) => {
              const { dollars, cents } = formatCurrency(account.balance)
              return (
                <Link
                  key={account.id}
                  href={`${basePath}/accounts/${account.id}`}
                  className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                >
                  {account.icon_url ? (
                    <img
                      src={resolveStorageUrl(account.icon_url)}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium ${getAvatarColor(index)}`}
                    >
                      {account.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="flex-1 min-w-0 truncate text-foreground text-sm">
                    {account.name}
                  </span>
                  <div className="text-right">
                    <span className="text-foreground font-medium">
                      ${dollars}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      .{cents}
                    </span>
                  </div>
                </Link>
              )
            })
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground text-sm mb-3">
                No accounts yet
              </p>
              <Button variant="outline" className="rounded-full" asChild>
                <Link href={`${basePath}/accounts/new`}>
                  <Plus className="h-4 w-4" />
                  Add Account
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* View All Link */}
        {accountsList.length > 0 && (
          <Link
            href={`${basePath}/accounts`}
            className="flex items-center gap-2 mt-4 pt-4 border-t text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs">
              +{Math.max(0, (accounts?.length || 0) - 5)}
            </div>
            <span>View all accounts</span>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
