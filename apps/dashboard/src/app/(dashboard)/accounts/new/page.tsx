"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

import { useCreateAccount } from "@/lib/api/hooks/use-accounts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AccountForm,
  type AccountFormData,
} from "@/components/account-form"

export default function NewAccountPage() {
  const router = useRouter()

  const createAccount = useCreateAccount()

  const handleSubmit = async (data: AccountFormData) => {
    try {
      await createAccount.mutateAsync({
        name: data.name,
        customized_name: data.customized_name || undefined,
        bank_id: data.bank_id,
        account_type_id: data.account_type_id,
        balance: parseFloat(data.balance),
      })

      toast.success("Account created successfully!")
      router.push(`/accounts`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create account"
      )
    }
  }

  const handleCancel = () => {
    router.push(`/accounts`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/accounts`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">New Account</h1>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent>
          <AccountForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={createAccount.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}
