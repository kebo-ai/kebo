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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
      return <ArrowDownCircle className="h-6 w-6 text-red-500" />
    case "Income":
      return <ArrowUpCircle className="h-6 w-6 text-green-500" />
    case "Transfer":
      return <ArrowLeftRight className="h-6 w-6 text-blue-500" />
    default:
      return <ArrowLeftRight className="h-6 w-6 text-muted-foreground" />
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
    <div className="flex justify-between py-3 border-b last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  )
}

function TransactionDetailSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-8 w-48" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex justify-between py-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-32" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default function TransactionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const lang = params.lang as string
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
      router.push(`/${lang}/app/transactions`)
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
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/${lang}/app/transactions`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Transaction Not Found</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              The transaction you are looking for does not exist or has been
              deleted.
            </p>
            <Button asChild>
              <Link href={`/${lang}/app/transactions`}>
                Back to Transactions
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(false)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Edit Transaction</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionForm
              initialData={transaction}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditing(false)}
              isLoading={isUpdating}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/${lang}/app/transactions`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Transaction Details</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this transaction? This action
                  cannot be undone and will affect your account balance.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              {transaction.category_icon ? (
                <span className="text-2xl">{transaction.category_icon}</span>
              ) : (
                <TransactionIcon type={transaction.transaction_type} />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                {transaction.transaction_type}
              </p>
              <p
                className={`text-3xl font-bold ${
                  transaction.transaction_type === "Income"
                    ? "text-green-600"
                    : transaction.transaction_type === "Expense"
                      ? "text-red-600"
                      : ""
                }`}
              >
                {transaction.transaction_type === "Income" ? "+" : "-"}
                {formatCurrency(transaction.amount, transaction.currency)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
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
                    <span className="text-muted-foreground">
                      {" "}
                      ({transaction.bank_name})
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-muted-foreground">-</span>
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
                  <span className="text-muted-foreground">Uncategorized</span>
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
        </CardContent>
      </Card>
    </div>
  )
}
