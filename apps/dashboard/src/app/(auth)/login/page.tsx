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
          redirectTo: `${window.location.origin}/callback`,
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
    <div className="flex min-h-svh bg-black">
      {/* Full-screen shell */}
      <div className="flex w-full min-h-svh">
        {/* Left panel — gradient mesh with dot grid */}
        <div className="relative hidden lg:flex lg:flex-1 overflow-hidden rounded-3xl m-3 mr-0">
          {/* Gradient mesh layer */}
          <div className="absolute inset-0">
            {/* Deep violet glow — top-left */}
            <div className="absolute -top-1/4 -left-1/4 h-[80%] w-[80%] rounded-full bg-violet-800/50 blur-[120px]" />
            {/* Purple glow — center */}
            <div className="absolute top-1/4 left-1/4 h-[60%] w-[60%] rounded-full bg-purple-500/50 blur-[100px]" />
            {/* Fuchsia glow — top-right */}
            <div className="absolute -top-1/4 -right-1/4 h-[70%] w-[70%] rounded-full bg-fuchsia-600/40 blur-[120px]" />
            {/* Dark fade — bottom half */}
            <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black via-black/80 to-transparent" />
          </div>

          {/* Dot grid overlay */}
          <svg
            className="absolute inset-0 h-full w-full opacity-[0.15]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="dot-grid"
                x="0"
                y="0"
                width="8"
                height="8"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="1" cy="1" r="0.8" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dot-grid)" />
          </svg>

          {/* Left panel text overlay */}
          <div className="relative z-10 flex flex-col justify-end p-10">
            <h2 className="text-4xl font-bold tracking-tight text-white">
              Get Started
              <br />
              with Kebo
            </h2>
            <p className="mt-3 max-w-xs text-sm text-white/60">
              Your finances, your goals, your flow&nbsp;&mdash; all in one
              place.
            </p>
          </div>
        </div>

        {/* Right panel — login form */}
        <div className="flex flex-1 flex-col items-center justify-center px-8 py-12 sm:px-12 lg:max-w-md">
          <div className="w-full max-w-sm">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <KeboLogo className="h-10 w-10" />
            </div>

            {/* Heading */}
            <div className="space-y-2 text-center mb-8">
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Sign In
              </h1>
              <p className="text-sm text-neutral-400">
                Sign in to your account to continue.
              </p>
            </div>

            {/* OAuth Buttons */}
            <div className="flex w-full gap-3 mb-8">
              <button
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-50"
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
                Google
              </button>
              <button
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-50"
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
                Apple
              </button>
            </div>

            {/* Footer links */}
            <div className="flex items-center justify-center gap-4 text-xs text-neutral-500">
              <a
                href={`${marketingUrl}/help`}
                className="hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Help
              </a>
              <span className="text-neutral-700">/</span>
              <a
                href={`${marketingUrl}/terms`}
                className="hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms
              </a>
              <span className="text-neutral-700">/</span>
              <a
                href={`${marketingUrl}/privacy-policy`}
                className="hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
