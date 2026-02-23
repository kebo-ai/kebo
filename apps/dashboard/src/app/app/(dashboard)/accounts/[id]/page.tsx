"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Wallet,
  Building2,
  Loader2,
  Star,
} from "lucide-react"
import { toast } from "sonner"

import {
  useAccount,
  useUpdateAccount,
  useDeleteAccount,
} from "@/lib/api/hooks/use-accounts"

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
  AccountForm,
  type AccountFormData,
} from "@/components/account-form"

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

function AccountDetailSkeleton() {
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
          {[...Array(5)].map((_, i) => (
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

export default function AccountDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { data: account, isLoading, error } = useAccount(id)
  const updateAccount = useUpdateAccount()
  const deleteAccount = useDeleteAccount()

  const isUpdating = updateAccount.isPending
  const isDeleting = deleteAccount.isPending

  const handleUpdate = async (data: AccountFormData) => {
    try {
      await updateAccount.mutateAsync({
        id,
        data: {
          name: data.name,
          customized_name: data.customized_name || undefined,
          bank_id: data.bank_id,
          account_type_id: data.account_type_id,
          balance: parseFloat(data.balance),
        },
      })

      toast.success("Account updated successfully!")
      setIsEditing(false)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update account"
      )
    }
  }

  const handleDelete = async () => {
    try {
      await deleteAccount.mutateAsync(id)
      toast.success("Account deleted successfully!")
      router.push(`/app/accounts`)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete account"
      )
    }
  }

  if (isLoading) {
    return <AccountDetailSkeleton />
  }

  if (error || !account) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/app/accounts`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Account Not Found</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              The account you are looking for does not exist or has been deleted.
            </p>
            <Button asChild>
              <Link href={`/app/accounts`}>Back to Accounts</Link>
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
          <h1 className="text-2xl font-bold">Edit Account</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent>
            <AccountForm
              initialData={account}
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
            <Link href={`/app/accounts`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Account Details</h1>
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
                <AlertDialogTitle>Delete Account</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this account? This will also
                  remove all associated transactions. This action cannot be
                  undone.
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

      {/* Account Summary Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              {account.icon_url ? (
                <img
                  src={account.icon_url}
                  alt=""
                  className="h-7 w-7 object-contain"
                />
              ) : (
                <Wallet className="h-7 w-7" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold">
                  {account.customized_name || account.name}
                </p>
                {account.is_default && (
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {account.account_type || "Account"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className="text-2xl font-bold">
                {formatCurrency(parseFloat(account.balance))}
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
          <DetailRow label="Account Name" value={account.name} />
          {account.customized_name && (
            <DetailRow label="Display Name" value={account.customized_name} />
          )}
          <DetailRow
            label="Account Type"
            value={account.account_type || "-"}
          />
          <DetailRow
            label="Bank"
            value={
              account.bank_name ? (
                <span className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {account.bank_name}
                </span>
              ) : (
                <span className="text-muted-foreground">-</span>
              )
            }
          />
          <DetailRow
            label="Balance"
            value={formatCurrency(parseFloat(account.balance))}
          />
          <DetailRow
            label="Default Account"
            value={account.is_default ? "Yes" : "No"}
          />
        </CardContent>
      </Card>
    </div>
  )
}
