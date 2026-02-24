import { QueryProvider } from "@/lib/api/providers/QueryProvider"
import { RealtimeSyncProvider } from "@/lib/realtime/realtime-provider"
import { Toaster } from "@/components/ui/sonner"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QueryProvider>
      <RealtimeSyncProvider>
        {children}
      </RealtimeSyncProvider>
      <Toaster />
    </QueryProvider>
  )
}
