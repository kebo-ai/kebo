"use client"

import { useState } from "react"

import type { Category, TransactionType } from "@/lib/api/types"

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

// Common emoji options for categories
const EMOJI_OPTIONS = [
  "🛒", "🍔", "🚗", "🏠", "💡", "📱", "🎬", "✈️", "🏥", "📚",
  "👕", "💇", "🎁", "🏋️", "🎮", "🐕", "👶", "💰", "📈", "💳",
  "🏦", "💵", "🎯", "⚡", "🔧", "🎨", "🎵", "☕", "🍕", "🚌",
]

export interface CategoryFormData {
  name: string
  type: TransactionType
  icon_emoji?: string
}

interface CategoryFormProps {
  initialData?: Category
  initialType?: TransactionType
  onSubmit: (data: CategoryFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export function CategoryForm({
  initialData,
  initialType,
  onSubmit,
  onCancel,
  isLoading,
}: CategoryFormProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: initialData?.name || "",
    type: initialData?.type || initialType || "Expense",
    icon_emoji: initialData?.icon_emoji || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required"
    }

    if (!formData.type) {
      newErrors.type = "Please select a category type"
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

  const updateField = <K extends keyof CategoryFormData>(
    field: K,
    value: CategoryFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Category Type */}
      <div className="space-y-2">
        <Label>Type</Label>
        <div className="flex gap-2">
          {(["Expense", "Income"] as const).map((type) => (
            <Button
              key={type}
              type="button"
              variant={formData.type === type ? "default" : "outline"}
              className={cn(
                "flex-1",
                formData.type === type &&
                  type === "Expense" &&
                  "bg-red-600 hover:bg-red-700",
                formData.type === type &&
                  type === "Income" &&
                  "bg-green-600 hover:bg-green-700"
              )}
              onClick={() => updateField("type", type)}
            >
              {type}
            </Button>
          ))}
        </div>
        {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
      </div>

      {/* Category Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Category Name</Label>
        <Input
          id="name"
          placeholder="e.g., Groceries, Salary, Entertainment"
          className={cn(errors.name && "border-red-500")}
          value={formData.name}
          onChange={(e) => updateField("name", e.target.value)}
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>

      {/* Icon Emoji */}
      <div className="space-y-2">
        <Label>Icon (optional)</Label>
        <div className="flex flex-wrap gap-2">
          {EMOJI_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className={cn(
                "w-10 h-10 text-xl rounded-lg border transition-colors hover:bg-accent",
                formData.icon_emoji === emoji &&
                  "border-primary bg-primary/10 ring-2 ring-primary ring-offset-2"
              )}
              onClick={() =>
                updateField(
                  "icon_emoji",
                  formData.icon_emoji === emoji ? "" : emoji
                )
              }
            >
              {emoji}
            </button>
          ))}
        </div>
        {formData.icon_emoji && (
          <p className="text-sm text-muted-foreground">
            Selected: {formData.icon_emoji}
          </p>
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
              ? "Update Category"
              : "Create Category"}
        </Button>
      </div>
    </form>
  )
}
