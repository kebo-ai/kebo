"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 1000, refetchOnWindowFocus: true },
        },
      })
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
