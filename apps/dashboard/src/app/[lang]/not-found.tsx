import Link from "next/link"

export default function NotFound() {
  return (
    <div className="dark dashboard flex min-h-screen items-center justify-center p-4 bg-dash-bg">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-dash-text mb-4">404</h1>
        <p className="text-dash-text-muted mb-6">Page not found</p>
        <Link
          href="/es/app"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-dash-accent text-white text-sm font-medium hover:bg-dash-accent/90 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
