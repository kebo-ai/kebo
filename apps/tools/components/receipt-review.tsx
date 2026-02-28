"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/currencies";
import { nanoid } from "nanoid";
import { Plus, Trash2, X } from "lucide-react";
import NumberFlow from "@number-flow/react";

type ReviewItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export function ReceiptReview({
  items,
  currency,
  tax,
  tip,
  title,
  onItemsChange,
  onTaxChange,
  onTipChange,
  onTitleChange,
  onCancel,
}: {
  items: ReviewItem[];
  currency: string;
  tax: number;
  tip: number;
  title: string;
  onItemsChange: (items: ReviewItem[]) => void;
  onTaxChange: (tax: number) => void;
  onTipChange: (tip: number) => void;
  onTitleChange: (title: string) => void;
  onCancel: () => void;
}) {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = subtotal + tax + tip;

  function updateItem(id: string, updates: Partial<ReviewItem>) {
    onItemsChange(
      items.map((i) => (i.id === id ? { ...i, ...updates } : i))
    );
  }

  function removeItem(id: string) {
    onItemsChange(items.filter((i) => i.id !== id));
  }

  function addItem() {
    onItemsChange([
      ...items,
      { id: nanoid(), name: "", price: 0, quantity: 1 },
    ]);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-display">Review Items</h2>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <Input
        placeholder="Restaurant name (optional)"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        className="h-10"
      />

      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <Input
              value={item.name}
              onChange={(e) => updateItem(item.id, { name: e.target.value })}
              placeholder="Item name"
              className="flex-1 h-9 text-sm"
            />
            <Input
              type="number"
              value={item.price || ""}
              onChange={(e) =>
                updateItem(item.id, { price: Number(e.target.value) })
              }
              placeholder="0.00"
              className="w-20 h-9 text-sm text-right tabular-nums"
              step="0.01"
              min="0"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 flex-shrink-0"
              onClick={() => removeItem(item.id)}
            >
              <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" onClick={addItem} className="w-fit">
        <Plus className="w-3.5 h-3.5 mr-1" />
        Add item
      </Button>

      <div className="border-t pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Subtotal</span>
          <NumberFlow
            value={subtotal}
            format={{ style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }}
            className="font-medium tabular-nums"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Tax</span>
          <Input
            type="number"
            value={tax || ""}
            onChange={(e) => onTaxChange(Number(e.target.value))}
            className="w-24 h-8 text-sm text-right tabular-nums"
            step="0.01"
            min="0"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Tip</span>
          <Input
            type="number"
            value={tip || ""}
            onChange={(e) => onTipChange(Number(e.target.value))}
            className="w-24 h-8 text-sm text-right tabular-nums"
            step="0.01"
            min="0"
          />
        </div>
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="font-semibold">Total</span>
          <NumberFlow
            value={total}
            format={{ style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }}
            className="text-lg font-bold tabular-nums"
            willChange
          />
        </div>
      </div>
    </div>
  );
}
