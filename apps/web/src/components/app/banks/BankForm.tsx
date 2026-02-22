"use client"

import { useState } from "react"

import type { Bank } from "@/lib/api/types"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

// Common country flag options
const COUNTRY_FLAGS = [
  { code: "PE", flag: "\u{1F1F5}\u{1F1EA}", name: "Peru" },
  { code: "MX", flag: "\u{1F1F2}\u{1F1FD}", name: "Mexico" },
  { code: "CO", flag: "\u{1F1E8}\u{1F1F4}", name: "Colombia" },
  { code: "AR", flag: "\u{1F1E6}\u{1F1F7}", name: "Argentina" },
  { code: "CL", flag: "\u{1F1E8}\u{1F1F1}", name: "Chile" },
  { code: "US", flag: "\u{1F1FA}\u{1F1F8}", name: "USA" },
  { code: "ES", flag: "\u{1F1EA}\u{1F1F8}", name: "Spain" },
  { code: "BR", flag: "\u{1F1E7}\u{1F1F7}", name: "Brazil" },
]

export interface BankFormData {
  name: string
  country_code: string
  country_flag: string
  bank_url: string
  description: string
  open_finance_integrated: boolean
}

interface BankFormProps {
  initialData?: Bank
  onSubmit: (data: BankFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export function BankForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: BankFormProps) {
  const [formData, setFormData] = useState<BankFormData>({
    name: initialData?.name || "",
    country_code: initialData?.country_code || "",
    country_flag: initialData?.country_flag || "",
    bank_url: initialData?.bank_url || "",
    description: initialData?.description || "",
    open_finance_integrated: initialData?.open_finance_integrated || false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Bank name is required"
    } else if (formData.name.length > 255) {
      newErrors.name = "Bank name must be less than 255 characters"
    }

    if (formData.bank_url && !isValidUrl(formData.bank_url)) {
      newErrors.bank_url = "Please enter a valid URL"
    }

    if (formData.description && formData.description.length > 255) {
      newErrors.description = "Description must be less than 255 characters"
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

  const updateField = <K extends keyof BankFormData>(
    field: K,
    value: BankFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  const selectCountry = (code: string, flag: string) => {
    const isSelected = formData.country_code === code
    setFormData((prev) => ({
      ...prev,
      country_code: isSelected ? "" : code,
      country_flag: isSelected ? "" : flag,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Bank Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Bank Name *</Label>
        <Input
          id="name"
          placeholder="e.g., Bank of America, BBVA"
          className={cn(errors.name && "border-red-500")}
          value={formData.name}
          onChange={(e) => updateField("name", e.target.value)}
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>

      {/* Country Selection */}
      <div className="space-y-2">
        <Label>Country (optional)</Label>
        <div className="flex flex-wrap gap-2">
          {COUNTRY_FLAGS.map(({ code, flag, name }) => (
            <button
              key={code}
              type="button"
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors hover:bg-accent",
                formData.country_code === code &&
                  "border-primary bg-primary/10 ring-2 ring-primary ring-offset-2"
              )}
              onClick={() => selectCountry(code, flag)}
            >
              <span className="text-lg">{flag}</span>
              <span className="text-sm">{name}</span>
            </button>
          ))}
        </div>
        {formData.country_code && (
          <p className="text-sm text-muted-foreground">
            Selected: {formData.country_flag} {formData.country_code}
          </p>
        )}
      </div>

      {/* Bank URL (for logo/icon) */}
      <div className="space-y-2">
        <Label htmlFor="bank_url">Logo URL (optional)</Label>
        <Input
          id="bank_url"
          type="url"
          placeholder="https://example.com/logo.png"
          className={cn(errors.bank_url && "border-red-500")}
          value={formData.bank_url}
          onChange={(e) => updateField("bank_url", e.target.value)}
        />
        {errors.bank_url && (
          <p className="text-sm text-red-500">{errors.bank_url}</p>
        )}
        <p className="text-xs text-muted-foreground">
          URL to the bank&apos;s logo image
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Input
          id="description"
          placeholder="Brief description of the bank"
          className={cn(errors.description && "border-red-500")}
          value={formData.description}
          onChange={(e) => updateField("description", e.target.value)}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description}</p>
        )}
      </div>

      {/* Open Finance Integration */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="open_finance">Open Finance Integrated</Label>
          <p className="text-sm text-muted-foreground">
            Enable if this bank supports Open Finance/Banking APIs
          </p>
        </div>
        <Switch
          id="open_finance"
          checked={formData.open_finance_integrated}
          onCheckedChange={(checked) =>
            updateField("open_finance_integrated", checked)
          }
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
              ? "Update Bank"
              : "Create Bank"}
        </Button>
      </div>
    </form>
  )
}
