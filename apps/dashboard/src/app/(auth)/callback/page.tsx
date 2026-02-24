"use client"

import { Suspense, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/auth/client"

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const exchanged = useRef(false)

  useEffect(() => {
    if (exchanged.current) return
    exchanged.current = true

    const code = searchParams.get("code")

    if (!code) {
      router.replace("/login?error=no_code")
      return
    }

    const supabase = createClient()

    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        console.error("[Callback] Exchange failed:", error.message)
        router.replace("/login?error=auth_error")
      } else {
        router.replace("/")
      }
    })
  }, [router, searchParams])

  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Signing you in…</p>
      </div>
    </div>
  )
}

export default function CallbackPage() {
  return (
    <Suspense>
      <CallbackHandler />
    </Suspense>
  )
}
