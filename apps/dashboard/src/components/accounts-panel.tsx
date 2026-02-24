"use client"

import { useAccounts } from "@/lib/api/hooks"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

const basePath = ""

const avatarColors = [
  "bg-blue-500/20 text-blue-400",
  "bg-emerald-500/20 text-emerald-400",
  "bg-purple-500/20 text-purple-400",
  "bg-orange-500/20 text-orange-400",
  "bg-pink-500/20 text-pink-400",
]

function getAvatarColor(index: number) {
  return avatarColors[index % avatarColors.length]
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
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium ${getAvatarColor(index)}`}
                  >
                    {account.icon_url ? (
                      <img
                        src={account.icon_url}
                        alt=""
                        className="h-6 w-6 object-contain"
                      />
                    ) : (
                      account.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="flex-1 text-foreground text-sm">
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
