"use client"

import Link from "next/link"
import { Plus, Building2, Globe, Zap } from "lucide-react"

import { useBanks } from "@/lib/api/hooks/use-banks"
import type { Bank } from "@/lib/api/types"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function BankItem({ bank }: { bank: Bank }) {
  return (
    <Link href={`/app/banks/${bank.id}`} className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        {bank.country_flag ? (
          <span className="text-lg">{bank.country_flag}</span>
        ) : bank.bank_url ? (
          <img
            src={bank.bank_url}
            alt=""
            className="h-6 w-6 object-contain rounded"
          />
        ) : (
          <Building2 className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-foreground font-medium truncate">
          {bank.name}
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground/70">
          {bank.country_code && (
            <>
              <Globe className="h-3 w-3" />
              <span>{bank.country_code}</span>
            </>
          )}
          {bank.description && (
            <span className="truncate">{bank.description}</span>
          )}
        </div>
      </div>
      {bank.open_finance_integrated && (
        <div className="px-2 py-1 text-xs rounded-full bg-success/10 text-success flex items-center gap-1">
          <Zap className="h-3 w-3" />
          Open Finance
        </div>
      )}
    </Link>
  )
}

function BankSkeleton() {
  return (
    <div className="flex items-center gap-4 px-3 py-3">
      <Skeleton className="h-10 w-10 rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32 bg-muted" />
        <Skeleton className="h-3 w-20 bg-muted" />
      </div>
      <Skeleton className="h-6 w-24 rounded-full bg-muted" />
    </div>
  )
}

export default function BanksPage() {

  const { data: banks, isLoading } = useBanks()

  const integratedCount =
    banks?.filter((b) => b.open_finance_integrated).length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Banks</h1>
          <p className="text-muted-foreground text-sm">
            Manage bank institutions for your accounts
          </p>
        </div>
        <Button className="rounded-full" asChild>
          <Link href={`/app/banks/new`}>
            <Plus className="h-4 w-4" />
            New Bank
          </Link>
        </Button>
      </div>

      {/* Stats Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Total Banks</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 bg-muted" />
              ) : (
                <p className="text-3xl font-bold text-foreground">
                  {banks?.length || 0}
                </p>
              )}
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-1">
                Open Finance Enabled
              </p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 bg-muted" />
              ) : (
                <p className="text-3xl font-bold text-success">
                  {integratedCount}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Banks List */}
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-border">
            <h2 className="text-foreground font-medium">All Banks</h2>
          </div>
          {isLoading ? (
            <div className="divide-y divide-border">
              {[...Array(5)].map((_, i) => (
                <BankSkeleton key={i} />
              ))}
            </div>
          ) : banks && banks.length > 0 ? (
            <div className="divide-y divide-border">
              {banks.map((bank) => (
                <BankItem key={bank.id} bank={bank} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No banks added yet</p>
              <Button className="rounded-full" asChild>
                <Link href={`/app/banks/new`}>
                  <Plus className="h-4 w-4" />
                  Add your first bank
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
