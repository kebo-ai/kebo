"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import {
  ArrowLeft,
  Pencil,
  Trash2,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

import {
  useTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from "@/lib/api/hooks"
import type { TransactionType } from "@/lib/api/types"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  TransactionForm,
  type TransactionFormData,
} from "@/components/app/transactions/TransactionForm"

function TransactionIcon({ type }: { type: TransactionType }) {
  switch (type) {
    case "Expense":
      return <ArrowDownCircle className="h-6 w-6 text-dash-error" />
    case "Income":
      return <ArrowUpCircle className="h-6 w-6 text-dash-success" />
    case "Transfer":
      return <ArrowLeftRight className="h-6 w-6 text-dash-accent" />
    default:
      return <ArrowLeftRight className="h-6 w-6 text-dash-text-muted" />
  }
}

function formatCurrency(amount: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex justify-between py-3 border-b border-dash-border last:border-b-0">
      <span className="text-dash-text-muted">{label}</span>
      <span className="font-medium text-dash-text text-right">{value}</span>
    </div>
  )
}

function TransactionDetailSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 bg-dash-card-hover" />
        <Skeleton className="h-8 w-48 bg-dash-card-hover" />
      </div>
      <div className="dash-card p-6">
        <Skeleton className="h-6 w-32 bg-dash-card-hover mb-4" />
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex justify-between py-3">
              <Skeleton className="h-5 w-24 bg-dash-card-hover" />
              <Skeleton className="h-5 w-32 bg-dash-card-hover" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function TransactionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { data: transaction, isLoading, error } = useTransaction(id)
  const updateTransaction = useUpdateTransaction()
  const deleteTransaction = useDeleteTransaction()

  const isUpdating = updateTransaction.isPending
  const isDeleting = deleteTransaction.isPending

  const handleUpdate = async (data: TransactionFormData) => {
    try {
      await updateTransaction.mutateAsync({
        id,
        data: {
          account_id: data.account_id,
          amount: parseFloat(data.amount),
          currency: "USD",
          transaction_type: data.transaction_type,
          date: data.date.toISOString(),
          description: data.description,
          category_id: data.category_id || undefined,
        },
      })

      toast.success("Transaction updated successfully!")
      setIsEditing(false)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update transaction"
      )
    }
  }

  const handleDelete = async () => {
    try {
      await deleteTransaction.mutateAsync(id)
      toast.success("Transaction deleted successfully!")
      router.push(`/app/transactions`)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete transaction"
      )
    }
  }

  if (isLoading) {
    return <TransactionDetailSkeleton />
  }

  if (error || !transaction) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href={`/app/transactions`}
            className="p-2 rounded-lg hover:bg-dash-card transition-colors text-dash-text-muted hover:text-dash-text"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-semibold text-dash-text">
            Transaction Not Found
          </h1>
        </div>
        <div className="dash-card p-12 text-center">
          <p className="text-dash-text-muted mb-4">
            The transaction you are looking for does not exist or has been
            deleted.
          </p>
          <Link href={`/app/transactions`} className="dash-btn-pill-primary">
            Back to Transactions
          </Link>
        </div>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsEditing(false)}
            className="p-2 rounded-lg hover:bg-dash-card transition-colors text-dash-text-muted hover:text-dash-text"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-semibold text-dash-text">
            Edit Transaction
          </h1>
        </div>
        <div className="dash-card p-6">
          <h2 className="text-lg font-medium text-dash-text mb-6">
            Transaction Details
          </h2>
          <TransactionForm
            initialData={transaction}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
            isLoading={isUpdating}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/app/transactions`}
            className="p-2 rounded-lg hover:bg-dash-card transition-colors text-dash-text-muted hover:text-dash-text"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-semibold text-dash-text">
            Transaction Details
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="dash-btn-pill"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </button>
          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <button className="dash-btn-pill text-dash-error hover:bg-dash-error/10">
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-dash-card border-dash-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-dash-text">
                  Delete Transaction
                </AlertDialogTitle>
                <AlertDialogDescription className="text-dash-text-muted">
                  Are you sure you want to delete this transaction? This action
                  cannot be undone and will affect your account balance.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  disabled={isDeleting}
                  className="bg-dash-card border-dash-border text-dash-text hover:bg-dash-card-hover"
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-dash-error text-white hover:bg-dash-error/90"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Transaction Summary Card */}
      <div className="dash-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-dash-card-hover">
            {transaction.category_icon ? (
              <span className="text-2xl">{transaction.category_icon}</span>
            ) : (
              <TransactionIcon type={transaction.transaction_type} />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm text-dash-text-muted">
              {transaction.transaction_type}
            </p>
            <p
              className={`text-3xl font-bold ${
                transaction.transaction_type === "Income"
                  ? "text-dash-success"
                  : transaction.transaction_type === "Expense"
                    ? "text-dash-error"
                    : "text-dash-text"
              }`}
            >
              {transaction.transaction_type === "Income" ? "+" : "-"}
              {formatCurrency(transaction.amount, transaction.currency)}
            </p>
          </div>
        </div>
      </div>

      {/* Details Card */}
      <div className="dash-card p-6">
        <h2 className="text-lg font-medium text-dash-text mb-4">Details</h2>
        <DetailRow label="Type" value={transaction.transaction_type} />
        <DetailRow
          label="Amount"
          value={formatCurrency(transaction.amount, transaction.currency)}
        />
        <DetailRow
          label="Date"
          value={format(new Date(transaction.date), "PPP")}
        />
        <DetailRow
          label="Account"
          value={
            transaction.account_name ? (
              <span>
                {transaction.account_name}
                {transaction.bank_name && (
                  <span className="text-dash-text-muted">
                    {" "}
                    ({transaction.bank_name})
                  </span>
                )}
              </span>
            ) : (
              <span className="text-dash-text-muted">-</span>
            )
          }
        />
        {transaction.transaction_type !== "Transfer" && (
          <DetailRow
            label="Category"
            value={
              transaction.category_name ? (
                <span>
                  {transaction.category_icon && (
                    <span className="mr-1">{transaction.category_icon}</span>
                  )}
                  {transaction.category_name}
                </span>
              ) : (
                <span className="text-dash-text-muted">Uncategorized</span>
              )
            }
          />
        )}
        {transaction.description && (
          <DetailRow label="Description" value={transaction.description} />
        )}
        {transaction.is_recurring && (
          <DetailRow
            label="Recurring"
            value={transaction.recurrence_cadence || "Yes"}
          />
        )}
        <DetailRow
          label="Created"
          value={format(new Date(transaction.created_at), "PPP 'at' p")}
        />
        {transaction.updated_at !== transaction.created_at && (
          <DetailRow
            label="Last Updated"
            value={format(new Date(transaction.updated_at), "PPP 'at' p")}
          />
        )}
      </div>
    </div>
  )
}
