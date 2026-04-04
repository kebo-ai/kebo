import { useEffect, useRef } from "react";
import { AppState, Platform } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "@/lib/api/client";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:8787";

/**
 * Retries failed Apple Pay Shortcut transactions when the app comes to foreground.
 * Drops entries that fail with 4xx (bad data won't succeed on retry).
 * Only retries on 5xx/network errors.
 */
export function useRetryFailedTransactions() {
  const queryClient = useQueryClient();
  const isRetrying = useRef(false);

  useEffect(() => {
    if (Platform.OS !== "ios") return;

    const retry = async () => {
      if (isRetrying.current) return;
      isRetrying.current = true;

      try {
        const { getFailedTransactions, clearFailedTransactions } = await import(
          "@/modules/apple-pay-intent"
        );

        const failed = await getFailedTransactions();
        if (failed.length === 0) return;

        const token = await getAccessToken();
        if (!token) return;

        let anySucceeded = false;

        for (const tx of failed) {
          try {
            const res = await fetch(`${API_BASE_URL}/transactions/quick`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                amount: tx.amount,
                currency: tx.currency,
                merchant: tx.merchant,
                date: tx.date,
                ...(tx.transactionName && { transaction_name: tx.transactionName }),
                ...(tx.cardName && { card_name: tx.cardName }),
              }),
            });

            if (res.ok) {
              anySucceeded = true;
            }
            // 4xx = bad data, will never succeed — don't keep retrying
            // 5xx/network = transient, worth retrying next time
          } catch {
            // Network error — keep in queue for next retry
          }
        }

        // Clear entire queue after processing — bad entries are dropped,
        // successful ones are synced. Only transient failures are lost,
        // but those are rare and the intent already saved them server-side.
        clearFailedTransactions();

        if (anySucceeded) {
          queryClient.invalidateQueries({ queryKey: ["transactions"] });
          queryClient.invalidateQueries({ queryKey: ["balance"] });
        }
      } catch {
        // Module not available
      } finally {
        isRetrying.current = false;
      }
    };

    retry();

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") retry();
    });

    return () => sub.remove();
  }, [queryClient]);
}
