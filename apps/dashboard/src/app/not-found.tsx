import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <p className="text-muted-foreground mb-6">Page not found</p>
        <Button asChild>
          <Link href="/">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
