"use client"

import { useState, useEffect } from "react"
import { format, addMonths, startOfMonth, endOfMonth } from "date-fns"
import { CalendarIcon, Plus, X } from "lucide-react"

import { useExpenseCategories } from "@/lib/api/hooks/use-categories"
import type { Budget, BudgetLine } from "@/lib/api/types"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface BudgetLineInput {
  category_id: string
  category_name?: string
  icon_emoji?: string
  amount: string
}

export interface BudgetFormData {
  custom_name?: string
  budget_amount: string
  start_date: Date
  end_date: Date
  is_recurrent: boolean
  budget_lines: BudgetLineInput[]
}

interface BudgetFormProps {
  initialData?: Budget & { budget_lines?: BudgetLine[] }
  onSubmit: (data: BudgetFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export function BudgetForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: BudgetFormProps) {
  const { data: categories } = useExpenseCategories()

  const defaultStartDate = startOfMonth(new Date())
  const defaultEndDate = endOfMonth(new Date())

  const [formData, setFormData] = useState<BudgetFormData>({
    custom_name: initialData?.custom_name || "",
    budget_amount: initialData?.budget_amount?.toString() || "",
    start_date: initialData?.start_date
      ? new Date(initialData.start_date)
      : defaultStartDate,
    end_date: initialData?.end_date
      ? new Date(initialData.end_date)
      : defaultEndDate,
    is_recurrent: initialData?.is_recurrent || false,
    budget_lines:
      initialData?.budget_lines?.map((line) => ({
        category_id: line.category_id,
        category_name: line.category_name,
        icon_emoji: line.icon_emoji,
        amount: line.amount?.toString() || "",
      })) || [],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Calculate total from budget lines
  const totalFromLines = formData.budget_lines.reduce(
    (sum, line) => sum + (parseFloat(line.amount) || 0),
    0
  )

  // Auto-update budget amount when lines change
  useEffect(() => {
    if (formData.budget_lines.length > 0 && totalFromLines > 0) {
      setFormData((prev) => ({
        ...prev,
        budget_amount: totalFromLines.toString(),
      }))
    }
  }, [totalFromLines])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (
      !formData.budget_amount ||
      parseFloat(formData.budget_amount) <= 0
    ) {
      newErrors.budget_amount = "Budget amount must be greater than 0"
    }

    if (!formData.start_date) {
      newErrors.start_date = "Start date is required"
    }

    if (!formData.end_date) {
      newErrors.end_date = "End date is required"
    }

    if (formData.start_date && formData.end_date && formData.start_date >= formData.end_date) {
      newErrors.end_date = "End date must be after start date"
    }

    // Validate budget lines
    formData.budget_lines.forEach((line, index) => {
      if (!line.category_id) {
        newErrors[`line_${index}_category`] = "Category is required"
      }
      if (!line.amount || parseFloat(line.amount) <= 0) {
        newErrors[`line_${index}_amount`] = "Amount must be greater than 0"
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(formData)
    }
  }

  const addBudgetLine = () => {
    setFormData((prev) => ({
      ...prev,
      budget_lines: [
        ...prev.budget_lines,
        { category_id: "", amount: "" },
      ],
    }))
  }

  const removeBudgetLine = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      budget_lines: prev.budget_lines.filter((_, i) => i !== index),
    }))
  }

  const updateBudgetLine = (
    index: number,
    field: keyof BudgetLineInput,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      budget_lines: prev.budget_lines.map((line, i) => {
        if (i === index) {
          const updated = { ...line, [field]: value }
          // If category changed, update the name and emoji
          if (field === "category_id") {
            const category = categories?.find((c) => c.id === value)
            if (category) {
              updated.category_name = category.name
              updated.icon_emoji = category.icon_emoji || undefined
            }
          }
          return updated
        }
        return line
      }),
    }))
    setErrors((prev) => ({ ...prev, [`line_${index}_${field}`]: "" }))
  }

  // Get available categories (not already selected)
  const getAvailableCategories = (currentIndex: number) => {
    const selectedIds = formData.budget_lines
      .filter((_, i) => i !== currentIndex)
      .map((line) => line.category_id)
    return categories?.filter((cat) => !selectedIds.includes(cat.id)) || []
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Budget Name */}
      <div className="space-y-2">
        <Label htmlFor="custom_name">Budget Name (optional)</Label>
        <Input
          id="custom_name"
          placeholder="e.g., February Budget"
          value={formData.custom_name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, custom_name: e.target.value }))
          }
        />
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.start_date && "text-muted-foreground",
                  errors.start_date && "border-red-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.start_date
                  ? format(formData.start_date, "PPP")
                  : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.start_date}
                onSelect={(date) =>
                  date &&
                  setFormData((prev) => ({ ...prev, start_date: date }))
                }
              />
            </PopoverContent>
          </Popover>
          {errors.start_date && (
            <p className="text-sm text-red-500">{errors.start_date}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.end_date && "text-muted-foreground",
                  errors.end_date && "border-red-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.end_date
                  ? format(formData.end_date, "PPP")
                  : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.end_date}
                onSelect={(date) =>
                  date && setFormData((prev) => ({ ...prev, end_date: date }))
                }
              />
            </PopoverContent>
          </Popover>
          {errors.end_date && (
            <p className="text-sm text-red-500">{errors.end_date}</p>
          )}
        </div>
      </div>

      {/* Recurring Toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Recurring Budget</Label>
          <p className="text-sm text-muted-foreground">
            Automatically create this budget each month
          </p>
        </div>
        <Switch
          checked={formData.is_recurrent}
          onCheckedChange={(checked: boolean) =>
            setFormData((prev) => ({ ...prev, is_recurrent: checked }))
          }
        />
      </div>

      {/* Category Allocations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Category Allocations</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addBudgetLine}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Category
          </Button>
        </div>

        {formData.budget_lines.length > 0 ? (
          <div className="space-y-3">
            {formData.budget_lines.map((line, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-1">
                  <Select
                    value={line.category_id}
                    onValueChange={(value) =>
                      updateBudgetLine(index, "category_id", value)
                    }
                  >
                    <SelectTrigger
                      className={cn(
                        errors[`line_${index}_category`] && "border-red-500"
                      )}
                    >
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableCategories(index).map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.icon_emoji} {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-32">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className={cn(
                        "pl-7",
                        errors[`line_${index}_amount`] && "border-red-500"
                      )}
                      value={line.amount}
                      onChange={(e) =>
                        updateBudgetLine(index, "amount", e.target.value)
                      }
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeBudgetLine(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {/* Total */}
            <div className="flex justify-end pt-2 border-t">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-lg font-semibold">
                  ${totalFromLines.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Add categories to allocate your budget
          </p>
        )}
      </div>

      {/* Total Budget Amount (if no lines or override) */}
      {formData.budget_lines.length === 0 && (
        <div className="space-y-2">
          <Label htmlFor="budget_amount">Total Budget Amount</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <Input
              id="budget_amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              className={cn("pl-7", errors.budget_amount && "border-red-500")}
              value={formData.budget_amount}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  budget_amount: e.target.value,
                }))
              }
            />
          </div>
          {errors.budget_amount && (
            <p className="text-sm text-red-500">{errors.budget_amount}</p>
          )}
        </div>
      )}

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
              ? "Update Budget"
              : "Create Budget"}
        </Button>
      </div>
    </form>
  )
}
