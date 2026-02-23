"use client"

import Link from "next/link"
import { Plus, Building2, Globe, Zap } from "lucide-react"

import { useBanks } from "@/lib/api/hooks/use-banks"
import type { Bank } from "@/lib/api/types"

import { Skeleton } from "@/components/ui/skeleton"

function BankItem({ bank }: { bank: Bank }) {
  return (
    <Link href={`/app/banks/${bank.id}`} className="dash-list-item">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-dash-card-hover">
        {bank.country_flag ? (
          <span className="text-lg">{bank.country_flag}</span>
        ) : bank.bank_url ? (
          <img
            src={bank.bank_url}
            alt=""
            className="h-6 w-6 object-contain rounded"
          />
        ) : (
          <Building2 className="h-5 w-5 text-dash-text-muted" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-dash-text-secondary font-medium truncate">
          {bank.name}
        </p>
        <div className="flex items-center gap-2 text-sm text-dash-text-dim">
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
        <div className="px-2 py-1 text-xs rounded-full bg-dash-success/10 text-dash-success flex items-center gap-1">
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
      <Skeleton className="h-10 w-10 rounded-full bg-dash-card-hover" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32 bg-dash-card-hover" />
        <Skeleton className="h-3 w-20 bg-dash-card-hover" />
      </div>
      <Skeleton className="h-6 w-24 rounded-full bg-dash-card-hover" />
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
          <h1 className="text-2xl font-semibold text-dash-text">Banks</h1>
          <p className="text-dash-text-muted text-sm">
            Manage bank institutions for your accounts
          </p>
        </div>
        <Link href={`/app/banks/new`} className="dash-btn-pill-primary">
          <Plus className="h-4 w-4" />
          New Bank
        </Link>
      </div>

      {/* Stats Card */}
      <div className="dash-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-dash-text-muted text-sm mb-1">Total Banks</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16 bg-dash-card-hover" />
            ) : (
              <p className="text-3xl font-bold text-dash-text">
                {banks?.length || 0}
              </p>
            )}
          </div>
          <div>
            <p className="text-dash-text-muted text-sm mb-1">
              Open Finance Enabled
            </p>
            {isLoading ? (
              <Skeleton className="h-8 w-16 bg-dash-card-hover" />
            ) : (
              <p className="text-3xl font-bold text-dash-success">
                {integratedCount}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Banks List */}
      <div className="dash-card">
        <div className="p-4 border-b border-dash-border">
          <h2 className="text-dash-text font-medium">All Banks</h2>
        </div>
        {isLoading ? (
          <div className="divide-y divide-dash-border">
            {[...Array(5)].map((_, i) => (
              <BankSkeleton key={i} />
            ))}
          </div>
        ) : banks && banks.length > 0 ? (
          <div className="divide-y divide-dash-border">
            {banks.map((bank) => (
              <BankItem key={bank.id} bank={bank} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 mx-auto text-dash-text-muted mb-4" />
            <p className="text-dash-text-muted mb-4">No banks added yet</p>
            <Link
              href={`/app/banks/new`}
              className="dash-btn-pill-primary"
            >
              <Plus className="h-4 w-4" />
              Add your first bank
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
