"use client";

import { ReceiptReview } from "@/components/receipt-review";
import { ReceiptScanner } from "@/components/receipt-scanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFingerprint } from "@/providers/fingerprint-provider";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { nanoid } from "nanoid";
import * as m from "motion/react-client";
import { AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { sileo } from "sileo";

type ReviewItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type ScanStep = "scan" | "review" | "name";

export default function ScanPage() {
  const router = useRouter();
  const fingerprint = useFingerprint();
  const [step, setStep] = useState<ScanStep>("scan");
  const [scanning, setScanning] = useState(false);
  const [creating, setCreating] = useState(false);

  const [items, setItems] = useState<ReviewItem[]>([]);
  const [currency, setCurrency] = useState("USD");
  const [tax, setTax] = useState(0);
  const [tip, setTip] = useState(0);
  const [title, setTitle] = useState("");
  const [creatorName, setCreatorName] = useState("");

  async function handleFile(file: File) {
    setScanning(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/ocr", { method: "POST", body: formData });
      if (!res.ok) throw new Error("OCR failed");
      const data = await res.json();
      setItems(
        (data.items || []).map(
          (i: { name: string; price: number; quantity?: number }) => ({
            id: nanoid(),
            name: i.name,
            price: i.price,
            quantity: i.quantity ?? 1,
          })
        )
      );
      if (data.currency) setCurrency(data.currency);
      if (data.tax) setTax(data.tax);
      if (data.title) setTitle(data.title);
      setStep("review");
    } catch {
      sileo.error({
        title: "Failed to scan receipt. Try again or add items manually.",
      });
      setItems([{ id: nanoid(), name: "", price: 0, quantity: 1 }]);
      setStep("review");
    } finally {
      setScanning(false);
    }
  }

  async function handleCreate() {
    if (!fingerprint || !creatorName.trim()) return;
    setCreating(true);
    try {
      const validItems = items.filter((i) => i.name.trim() && i.price > 0);
      if (validItems.length === 0) {
        sileo.error({
          title: "Add at least one item with a name and price.",
        });
        setCreating(false);
        return;
      }
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || null,
          currency,
          tax,
          tip,
          items: validItems.map((i) => ({
            name: i.name,
            price: i.price,
            quantity: i.quantity,
          })),
          creator: { fingerprint, name: creatorName.trim() },
        }),
      });
      if (!res.ok) throw new Error("Failed to create session");
      const { id, memberId } = await res.json();
      localStorage.setItem(
        `divvy:member:${id}`,
        JSON.stringify({
          id: memberId,
          name: creatorName.trim(),
          avatarSeed: "",
        })
      );
      router.push(`/s/${id}`);
    } catch {
      sileo.error({ title: "Failed to create session. Please try again." });
      setCreating(false);
    }
  }

  return (
    <div className="min-h-dvh bg-background">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <m.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex items-center gap-3 mb-6"
        >
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-display">
            {step === "scan" && "Scan Receipt"}
            {step === "review" && "Review Items"}
            {step === "name" && "Almost Done"}
          </h1>
        </m.div>

        <AnimatePresence mode="wait">
          {step === "scan" && (
            <m.div
              key="scan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
            >
              <ReceiptScanner onFile={handleFile} loading={scanning} />
            </m.div>
          )}

          {step === "review" && (
            <m.div
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="flex flex-col gap-6"
            >
              <ReceiptReview
                items={items}
                currency={currency}
                tax={tax}
                tip={tip}
                title={title}
                onItemsChange={setItems}
                onTaxChange={setTax}
                onTipChange={setTip}
                onTitleChange={setTitle}
                onCancel={() => {
                  setStep("scan");
                  setItems([]);
                }}
              />
              <Button
                className="w-full h-12 text-base"
                onClick={() => setStep("name")}
                disabled={
                  items.filter((i) => i.name.trim() && i.price > 0).length === 0
                }
              >
                Continue
              </Button>
            </m.div>
          )}

          {step === "name" && (
            <m.div
              key="name"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="flex flex-col items-center gap-6 py-8"
            >
              <div className="text-center">
                <m.h2
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-xl font-display"
                >
                  What&apos;s your name?
                </m.h2>
                <m.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm text-muted-foreground mt-1"
                >
                  So your friends know who started the bill
                </m.p>
              </div>
              <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 25 }}
              >
                <Input
                  placeholder="Your name"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  className="max-w-xs text-center text-lg h-12"
                  autoFocus
                  maxLength={20}
                />
              </m.div>
              <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, type: "spring", stiffness: 300, damping: 25 }}
                className="flex gap-3 w-full max-w-xs"
              >
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("review")}
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  disabled={!creatorName.trim() || !fingerprint || creating}
                  onClick={handleCreate}
                >
                  {creating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Create"
                  )}
                </Button>
              </m.div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
