import { Sidebar } from "@/components/app/layout/Sidebar"
import { createClient } from "@/lib/auth/server"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check authentication on the server
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/app/login")
  }

  return (
    <div className="dark dashboard flex h-screen bg-dash-bg">
      <Sidebar user={user} />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
