import { QueryProvider } from "@/lib/api/providers/QueryProvider"
import { Toaster } from "@/components/ui/sonner"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QueryProvider>
      {children}
      <Toaster />
    </QueryProvider>
  )
}
