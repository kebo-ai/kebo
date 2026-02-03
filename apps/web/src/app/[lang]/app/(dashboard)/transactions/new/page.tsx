"use client"

import { useParams, useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { useCreateTransaction, useCreateTransfer } from "@/lib/api/hooks"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  TransactionForm,
  type TransactionFormData,
} from "@/components/app/transactions/TransactionForm"

export default function NewTransactionPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const lang = params.lang as string

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
      router.push(`/${lang}/app/transactions`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create transaction"
      )
    }
  }

  const handleCancel = () => {
    router.push(`/${lang}/app/transactions`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/${lang}/app/transactions`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">New Transaction</h1>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionForm
            initialType={initialType || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  )
}
