"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

import { useCreateBank } from "@/lib/api/hooks/use-banks"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BankForm, type BankFormData } from "@/components/app/banks/BankForm"

export default function NewBankPage() {
  const params = useParams()
  const router = useRouter()
  const lang = params.lang as string

  const createBank = useCreateBank()

  const handleSubmit = async (data: BankFormData) => {
    try {
      await createBank.mutateAsync({
        name: data.name,
        country_code: data.country_code || undefined,
        country_flag: data.country_flag || undefined,
        bank_url: data.bank_url || undefined,
        description: data.description || undefined,
        open_finance_integrated: data.open_finance_integrated,
      })

      toast.success("Bank created successfully!")
      router.push(`/${lang}/app/banks`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create bank"
      )
    }
  }

  const handleCancel = () => {
    router.push(`/${lang}/app/banks`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/${lang}/app/banks`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">New Bank</h1>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Bank Details</CardTitle>
        </CardHeader>
        <CardContent>
          <BankForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={createBank.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}
