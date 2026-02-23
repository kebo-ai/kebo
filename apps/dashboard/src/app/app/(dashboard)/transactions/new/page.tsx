"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { useCreateTransaction, useCreateTransfer } from "@/lib/api/hooks"
import {
  TransactionForm,
  type TransactionFormData,
} from "@/components/app/transactions/TransactionForm"

export default function NewTransactionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialType = searchParams.get("type") as
    | "Expense"
    | "Income"
    | "Transfer"
    | null

  const createTransaction = useCreateTransaction()
  const createTransfer = useCreateTransfer()

  const isLoading = createTransaction.isPending || createTransfer.isPending

  const handleSubmit = async (data: TransactionFormData) => {
    try {
      if (data.transaction_type === "Transfer") {
        await createTransfer.mutateAsync({
          from_account_id: data.account_id,
          to_account_id: data.to_account_id!,
          amount: parseFloat(data.amount),
          currency: "USD",
          date: data.date.toISOString(),
          description: data.description,
        })
      } else {
        await createTransaction.mutateAsync({
          account_id: data.account_id,
          amount: parseFloat(data.amount),
          currency: "USD",
          transaction_type: data.transaction_type,
          date: data.date.toISOString(),
          description: data.description,
          category_id: data.category_id || undefined,
        })
      }

      toast.success("Transaction created successfully!")
      router.push(`/app/transactions`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create transaction"
      )
    }
  }

  const handleCancel = () => {
    router.push(`/app/transactions`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/app/transactions"
          className="p-2 rounded-lg hover:bg-dash-card transition-colors text-dash-text-muted hover:text-dash-text"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-semibold text-dash-text">
          New Transaction
        </h1>
      </div>

      {/* Form */}
      <div className="dash-card p-6">
        <h2 className="text-lg font-medium text-dash-text mb-6">
          Transaction Details
        </h2>
        <TransactionForm
          initialType={initialType || undefined}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
