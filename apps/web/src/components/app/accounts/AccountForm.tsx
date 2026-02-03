"use client"

import { useEffect, useState } from "react"

import { useAccountTypes } from "@/lib/api/hooks/use-accounts"
import { useBanks } from "@/lib/api/hooks/use-banks"
import type { Account } from "@/lib/api/types"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export interface AccountFormData {
  name: string
  customized_name?: string
  bank_id: string
  account_type_id: string
  balance: string
}

interface AccountFormProps {
  initialData?: Account
  onSubmit: (data: AccountFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export function AccountForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: AccountFormProps) {
  const { data: accountTypes } = useAccountTypes()
  const { data: banks } = useBanks()

  const [formData, setFormData] = useState<AccountFormData>({
    name: initialData?.name || "",
    customized_name: initialData?.customized_name || "",
    bank_id: initialData?.bank_id || "",
    account_type_id: initialData?.account_type_id || "",
    balance: initialData?.balance?.toString() || "0",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Set default account type when account types load
  useEffect(() => {
    if (accountTypes?.length && !formData.account_type_id) {
      setFormData((prev) => ({ ...prev, account_type_id: accountTypes[0].id }))
    }
  }, [accountTypes, formData.account_type_id])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Account name is required"
    }

    if (!formData.account_type_id) {
      newErrors.account_type_id = "Please select an account type"
    }

    if (!formData.bank_id) {
      newErrors.bank_id = "Please select a bank"
    }

    const balanceNum = parseFloat(formData.balance)
    if (isNaN(balanceNum)) {
      newErrors.balance = "Please enter a valid balance"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(formData)
    }
  }

  const updateField = <K extends keyof AccountFormData>(
    field: K,
    value: AccountFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Account Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Account Name</Label>
        <Input
          id="name"
          placeholder="e.g., Main Checking"
          className={cn(errors.name && "border-red-500")}
          value={formData.name}
          onChange={(e) => updateField("name", e.target.value)}
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>

      {/* Custom Name (optional) */}
      <div className="space-y-2">
        <Label htmlFor="customized_name">Custom Display Name (optional)</Label>
        <Input
          id="customized_name"
          placeholder="e.g., My Savings"
          value={formData.customized_name}
          onChange={(e) => updateField("customized_name", e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          This name will be shown instead of the account name
        </p>
      </div>

      {/* Account Type */}
      <div className="space-y-2">
        <Label>Account Type</Label>
        <Select
          value={formData.account_type_id}
          onValueChange={(value) => updateField("account_type_id", value)}
        >
          <SelectTrigger
            className={cn(errors.account_type_id && "border-red-500")}
          >
            <SelectValue placeholder="Select account type" />
          </SelectTrigger>
          <SelectContent>
            {accountTypes?.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.type_name}
                {type.description && (
                  <span className="text-muted-foreground ml-2">
                    - {type.description}
                  </span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.account_type_id && (
          <p className="text-sm text-red-500">{errors.account_type_id}</p>
        )}
      </div>

      {/* Bank */}
      <div className="space-y-2">
        <Label>Bank</Label>
        <Select
          value={formData.bank_id}
          onValueChange={(value) => updateField("bank_id", value)}
        >
          <SelectTrigger className={cn(errors.bank_id && "border-red-500")}>
            <SelectValue placeholder="Select bank" />
          </SelectTrigger>
          <SelectContent>
            {banks?.map((bank) => (
              <SelectItem key={bank.id} value={bank.id}>
                {bank.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.bank_id && (
          <p className="text-sm text-red-500">{errors.bank_id}</p>
        )}
      </div>

      {/* Initial Balance */}
      <div className="space-y-2">
        <Label htmlFor="balance">
          {initialData ? "Current Balance" : "Initial Balance"}
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            $
          </span>
          <Input
            id="balance"
            type="number"
            step="0.01"
            placeholder="0.00"
            className={cn("pl-7", errors.balance && "border-red-500")}
            value={formData.balance}
            onChange={(e) => updateField("balance", e.target.value)}
          />
        </div>
        {errors.balance && (
          <p className="text-sm text-red-500">{errors.balance}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading
            ? "Saving..."
            : initialData
              ? "Update Account"
              : "Create Account"}
        </Button>
      </div>
    </form>
  )
}
