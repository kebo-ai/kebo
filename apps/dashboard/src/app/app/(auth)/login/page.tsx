"use client"

import { useState } from "react"
import { createClient } from "@/lib/auth/client"
import { KeboLogo } from "@/components/logos/kebo"
import { toast } from "sonner"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClient()

  const handleOAuthLogin = async (provider: "google" | "apple") => {
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/app/callback`,
        },
      })

      if (error) throw error
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      )
      setIsLoading(false)
    }
  }

  const marketingUrl =
    process.env.NEXT_PUBLIC_MARKETING_URL || "https://kebo.app"

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left — Form */}
      <div className="flex flex-col">
        {/* Logo */}
        <div className="p-6 md:p-10">
          <KeboLogo className="h-8 w-8" />
        </div>

        {/* Centered form */}
        <div className="flex flex-1 items-center justify-center px-6 pb-16">
          <div className="w-full max-w-sm space-y-8">
            {/* Heading */}
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Welcome back!
              </h1>
              <p className="text-muted-foreground">
                Your finances, your goals, your flow&nbsp;&mdash; all in one
                place.
              </p>
            </div>

            {/* OAuth Buttons */}
            <div className="flex gap-3">
              <button
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                onClick={() => handleOAuthLogin("google")}
                disabled={isLoading}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 0 1-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign In with Google
              </button>
              <button
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                onClick={() => handleOAuthLogin("apple")}
                disabled={isLoading}
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Sign In with Apple
              </button>
            </div>

            {/* Footer links */}
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <a
                href={`${marketingUrl}/help`}
                className="hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Help
              </a>
              <span className="text-border">/</span>
              <a
                href={`${marketingUrl}/terms`}
                className="hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms
              </a>
              <span className="text-border">/</span>
              <a
                href={`${marketingUrl}/privacy-policy`}
                className="hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Visual panel */}
      <div className="relative hidden lg:block overflow-hidden rounded-l-3xl">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-kebo-600 via-kebo-500 to-kebo-400" />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Floating accent shapes */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-kebo-900/20 blur-3xl" />

        {/* Content overlay */}
        <div className="relative flex h-full flex-col items-center justify-center px-12 text-white">
          <div className="max-w-md space-y-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl">
              <KeboLogo className="h-12 w-12" />
            </div>
            <blockquote className="space-y-3">
              <p className="text-xl font-medium leading-relaxed text-white/90">
                &ldquo;Finally a finance app that feels like it was built for
                me. Simple, beautiful, and actually useful.&rdquo;
              </p>
              <footer className="text-sm text-white/60">
                &mdash; Early Kebo user
              </footer>
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  )
}
