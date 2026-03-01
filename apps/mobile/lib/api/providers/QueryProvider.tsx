import { useEffect } from "react"
import { AppState, type AppStateStatus } from "react-native"
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
} from "@tanstack/react-query"

// Refetch stale queries when app comes to foreground
function useMobileAppFocus() {
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (status: AppStateStatus) => {
        focusManager.setFocused(status === "active")
      },
    )
    return () => subscription.remove()
  }, [])
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
})

function AppFocusManager() {
  useMobileAppFocus()
  return null
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppFocusManager />
      {children}
    </QueryClientProvider>
  )
}
