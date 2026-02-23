"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { useAccounts } from "@/lib/api/hooks/use-accounts"
import { useCategories } from "@/lib/api/hooks/use-categories"
import type { Transaction } from "@/lib/api/types"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export interface TransactionFormData {
  transaction_type: "Expense" | "Income" | "Transfer"
  amount: string
  account_id: string
  category_id?: string
  date: Date
  description?: string
  to_account_id?: string
}

interface TransactionFormProps {
  initialData?: Transaction
  initialType?: "Expense" | "Income" | "Transfer"
  onSubmit: (data: TransactionFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export function TransactionForm({
  initialData,
  initialType,
  onSubmit,
  onCancel,
  isLoading,
}: TransactionFormProps) {
  const { data: accounts } = useAccounts()
  const { data: categories } = useCategories()

  const [formData, setFormData] = useState<TransactionFormData>({
    transaction_type: initialData?.transaction_type as TransactionFormData["transaction_type"] || initialType || "Expense",
    amount: initialData?.amount?.toString() || "",
    account_id: initialData?.account_id || "",
    category_id: initialData?.category_id || "",
    date: initialData?.date ? new Date(initialData.date) : new Date(),
    description: initialData?.description || "",
    to_account_id: initialData?.to_account_id || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const isTransfer = formData.transaction_type === "Transfer"

  // Filter categories by transaction type
  const filteredCategories = categories?.filter(
    (cat) =>
      cat.is_visible &&
      !cat.is_deleted &&
      (isTransfer || cat.type === formData.transaction_type)
  )

  // Set default account when accounts load
  useEffect(() => {
    if (accounts?.length && !formData.account_id) {
      const defaultAccount = accounts.find((a) => a.is_default) || accounts[0]
      if (defaultAccount) {
        setFormData((prev) => ({ ...prev, account_id: defaultAccount.id }))
      }
    }
  }, [accounts, formData.account_id])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0"
    }

    if (!formData.account_id) {
      newErrors.account_id = "Please select an account"
    }

    if (isTransfer && !formData.to_account_id) {
      newErrors.to_account_id = "Please select a destination account"
    }

    if (isTransfer && formData.account_id === formData.to_account_id) {
      newErrors.to_account_id = "Destination must be different from source"
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

  const updateField = <K extends keyof TransactionFormData>(
    field: K,
    value: TransactionFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Transaction Type */}
      <div className="space-y-2">
        <Label>Type</Label>
        <div className="flex gap-2">
          {(["Expense", "Income", "Transfer"] as const).map((type) => (
            <Button
              key={type}
              type="button"
              variant={formData.transaction_type === type ? "default" : "outline"}
              className={cn(
                "flex-1",
                formData.transaction_type === type &&
                  type === "Expense" &&
                  "bg-red-600 hover:bg-red-700",
                formData.transaction_type === type &&
                  type === "Income" &&
                  "bg-green-600 hover:bg-green-700",
                formData.transaction_type === type &&
                  type === "Transfer" &&
                  "bg-blue-600 hover:bg-blue-700"
              )}
              onClick={() => updateField("transaction_type", type)}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            $
          </span>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            className={cn("pl-7 text-lg", errors.amount && "border-red-500")}
            value={formData.amount}
            onChange={(e) => updateField("amount", e.target.value)}
          />
        </div>
        {errors.amount && (
          <p className="text-sm text-red-500">{errors.amount}</p>
        )}
      </div>

      {/* Account (From Account for transfers) */}
      <div className="space-y-2">
        <Label>{isTransfer ? "From Account" : "Account"}</Label>
        <Select
          value={formData.account_id}
          onValueChange={(value) => updateField("account_id", value)}
        >
          <SelectTrigger className={cn(errors.account_id && "border-red-500")}>
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            {accounts?.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.customized_name || account.name}
                {account.bank_name && ` (${account.bank_name})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.account_id && (
          <p className="text-sm text-red-500">{errors.account_id}</p>
        )}
      </div>

      {/* To Account (for transfers) */}
      {isTransfer && (
        <div className="space-y-2">
          <Label>To Account</Label>
          <Select
            value={formData.to_account_id}
            onValueChange={(value) => updateField("to_account_id", value)}
          >
            <SelectTrigger className={cn(errors.to_account_id && "border-red-500")}>
              <SelectValue placeholder="Select destination account" />
            </SelectTrigger>
            <SelectContent>
              {accounts
                ?.filter((a) => a.id !== formData.account_id)
                .map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.customized_name || account.name}
                    {account.bank_name && ` (${account.bank_name})`}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {errors.to_account_id && (
            <p className="text-sm text-red-500">{errors.to_account_id}</p>
          )}
        </div>
      )}

      {/* Category (not for transfers) */}
      {!isTransfer && (
        <div className="space-y-2">
          <Label>Category (optional)</Label>
          <Select
            value={formData.category_id}
            onValueChange={(value) => updateField("category_id", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {filteredCategories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.icon_emoji} {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Date */}
      <div className="space-y-2">
        <Label>Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full pl-3 text-left font-normal",
                !formData.date && "text-muted-foreground"
              )}
            >
              {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formData.date}
              onSelect={(date) => date && updateField("date", date)}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          placeholder="Add a note..."
          rows={3}
          value={formData.description}
          onChange={(e) => updateField("description", e.target.value)}
        />
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
              ? "Update Transaction"
              : "Add Transaction"}
        </Button>
      </div>
    </form>
  )
}
