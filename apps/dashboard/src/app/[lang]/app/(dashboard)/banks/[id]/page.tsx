"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Building2,
  Loader2,
  Globe,
  Zap,
  Link as LinkIcon,
} from "lucide-react"
import { toast } from "sonner"

import {
  useBank,
  useUpdateBank,
  useDeleteBank,
} from "@/lib/api/hooks/use-banks"

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
import { BankForm, type BankFormData } from "@/components/app/banks/BankForm"

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

function BankDetailSkeleton() {
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

export default function BankDetailPage() {
  const params = useParams()
  const router = useRouter()
  const lang = params.lang as string
  const id = params.id as string

  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { data: bank, isLoading, error } = useBank(id)
  const updateBank = useUpdateBank()
  const deleteBank = useDeleteBank()

  const isUpdating = updateBank.isPending
  const isDeleting = deleteBank.isPending

  const handleUpdate = async (data: BankFormData) => {
    try {
      await updateBank.mutateAsync({
        id,
        data: {
          name: data.name,
          country_code: data.country_code || undefined,
          country_flag: data.country_flag || undefined,
          bank_url: data.bank_url || undefined,
          description: data.description || undefined,
          open_finance_integrated: data.open_finance_integrated,
        },
      })

      toast.success("Bank updated successfully!")
      setIsEditing(false)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update bank"
      )
    }
  }

  const handleDelete = async () => {
    try {
      await deleteBank.mutateAsync(id)
      toast.success("Bank deleted successfully!")
      router.push(`/${lang}/app/banks`)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete bank"
      )
    }
  }

  if (isLoading) {
    return <BankDetailSkeleton />
  }

  if (error || !bank) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/${lang}/app/banks`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Bank Not Found</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              The bank you are looking for does not exist or has been deleted.
            </p>
            <Button asChild>
              <Link href={`/${lang}/app/banks`}>Back to Banks</Link>
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
          <h1 className="text-2xl font-bold">Edit Bank</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Bank Details</CardTitle>
          </CardHeader>
          <CardContent>
            <BankForm
              initialData={bank}
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
            <Link href={`/${lang}/app/banks`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Bank Details</h1>
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
                <AlertDialogTitle>Delete Bank</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this bank? Accounts using this
                  bank will lose their bank reference. This action cannot be
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

      {/* Bank Summary Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              {bank.country_flag ? (
                <span className="text-2xl">{bank.country_flag}</span>
              ) : bank.bank_url ? (
                <img
                  src={bank.bank_url}
                  alt=""
                  className="h-8 w-8 object-contain rounded"
                />
              ) : (
                <Building2 className="h-7 w-7 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-lg font-semibold">{bank.name}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {bank.country_code && (
                  <>
                    <Globe className="h-4 w-4" />
                    <span>{bank.country_code}</span>
                  </>
                )}
              </div>
            </div>
            {bank.open_finance_integrated && (
              <div className="px-3 py-1.5 text-sm rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1">
                <Zap className="h-4 w-4" />
                Open Finance
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <DetailRow label="Name" value={bank.name} />
          <DetailRow
            label="Country"
            value={
              bank.country_code ? (
                <span className="flex items-center gap-2">
                  {bank.country_flag} {bank.country_code}
                </span>
              ) : (
                <span className="text-muted-foreground">Not specified</span>
              )
            }
          />
          <DetailRow
            label="Description"
            value={
              bank.description || (
                <span className="text-muted-foreground">None</span>
              )
            }
          />
          <DetailRow
            label="Logo URL"
            value={
              bank.bank_url ? (
                <a
                  href={bank.bank_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  <LinkIcon className="h-3 w-3" />
                  View
                </a>
              ) : (
                <span className="text-muted-foreground">None</span>
              )
            }
          />
          <DetailRow
            label="Open Finance"
            value={bank.open_finance_integrated ? "Enabled" : "Disabled"}
          />
        </CardContent>
      </Card>
    </div>
  )
}
