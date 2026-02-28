import { gateway } from "@ai-sdk/gateway";
import { Mistral } from "@mistralai/mistralai";
import { generateObject } from "ai";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { z } from "zod";

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

const receiptSchema = z.object({
  items: z.array(
    z.object({
      name: z.string().describe("Item name, cleaned up and properly capitalized"),
      price: z.number().describe("Unit price as a number"),
      quantity: z.number().int().default(1).describe("Quantity, defaults to 1"),
    })
  ),
  currency: z.string().default("USD").describe("3-letter ISO currency code"),
  tax: z.number().default(0).describe("Tax amount shown on receipt, 0 if not visible"),
  title: z.string().default("").describe("Restaurant/store name if visible"),
});

const PROMPT = `You are an expert receipt parser. Given the OCR text from a receipt, extract every individual line item.

IMPORTANT:
- The receipt may have been rotated, sideways, or upside down — the OCR text may be messy. Do your best to interpret it.
- Carefully distinguish between ITEMS and NON-ITEMS. Subtotals, totals, tax lines, tip lines, discounts, payment info, change, and balance are NOT items.
- If an item has a quantity multiplier (e.g. "2 x Burger" or "Qty: 3"), set quantity accordingly and use the UNIT price.
- If a price has been voided or crossed out, skip it.
- For combo/meal deals, list the combo as one item at its total price.
- Clean up item names: capitalize properly, remove codes/numbers/SKUs.
- Infer currency from symbols: $ → USD, € → EUR, £ → GBP, ¥ → JPY, etc.`;

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  let fileId: string | undefined;

  try {
    // 1. Preprocess image with sharp
    const buffer = Buffer.from(await file.arrayBuffer());
    const processed = await sharp(buffer)
      .rotate() // auto-orient from EXIF
      .normalize() // stretch contrast
      .sharpen({ sigma: 1.5 }) // sharpen text
      .toFormat("jpeg", { quality: 90 })
      .toBuffer();

    // 2. Upload to Mistral for OCR
    const blob = new Blob([new Uint8Array(processed)], { type: "image/jpeg" });
    const uploadResp = await mistral.files.upload({
      file: { fileName: "receipt.jpg", content: blob },
      purpose: "ocr",
    });
    fileId = uploadResp.id;

    // Poll until processing is done
    for (let i = 0; i < 15; i++) {
      const check = await mistral.files.retrieve({ fileId });
      if (
        (check as Record<string, unknown>).sampleType === "ocr" ||
        (check as Record<string, unknown>).numLines !== undefined
      ) {
        break;
      }
      await new Promise((r) => setTimeout(r, 1000));
    }

    // 3. Run Mistral OCR
    const ocrResponse = await mistral.ocr.process({
      model: "mistral-ocr-latest",
      document: { type: "file", fileId },
    });

    const ocrText = ocrResponse.pages.map((p) => p.markdown).join("\n\n");

    // 4. Use AI SDK + Gateway to extract structured data
    const { object } = await generateObject({
      model: gateway("anthropic/claude-sonnet-4.6"),
      schema: receiptSchema,
      prompt: `${PROMPT}\n\nHere is the OCR text from the receipt:\n\n${ocrText}`,
      temperature: 0,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error("OCR error:", error);
    return NextResponse.json(
      { error: "Failed to process receipt" },
      { status: 500 }
    );
  } finally {
    if (fileId) {
      await mistral.files.delete({ fileId }).catch(() => {});
    }
  }
}
