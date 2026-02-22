"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/auth/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import Link from "next/link"

export default function LoginPage() {
  const params = useParams()
  const router = useRouter()
  const lang = params.lang as string

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")

  const supabase = createClient()

  const handleEmailPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (authMode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/${lang}/app/callback`,
          },
        })
        if (error) throw error
        toast.success("Check your email to confirm your account!")
        setEmailSent(true)
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push(`/${lang}/app`)
        router.refresh()
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/${lang}/app/callback`,
        },
      })

      if (error) throw error

      setEmailSent(true)
      toast.success("Check your email for the login link!")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: "google" | "apple") => {
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/${lang}/app/callback`,
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

  if (emailSent) {
    return (
      <div className="dark dashboard flex min-h-screen items-center justify-center p-4 bg-dash-bg">
        <div className="dash-card w-full max-w-md p-8">
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-kebo-500 to-kebo-600 text-white text-2xl font-bold shadow-lg shadow-kebo-500/20">
              K
            </div>
            <h1 className="text-xl font-semibold text-dash-text mb-2">
              Check your email
            </h1>
            <p className="text-dash-text-muted text-sm">
              We sent{" "}
              {authMode === "signup" ? "a confirmation" : "a login"} link to{" "}
              <strong className="text-dash-text">{email}</strong>
            </p>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-dash-text-dim text-center">
              Click the link in the email to{" "}
              {authMode === "signup" ? "confirm your account" : "sign in"}.
            </p>
            <button
              className="w-full dash-btn-pill justify-center"
              onClick={() => setEmailSent(false)}
            >
              Use a different email
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dark dashboard flex min-h-screen items-center justify-center p-4 bg-dash-bg">
      <div className="dash-card w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href={`/${lang}`}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-kebo-500 to-kebo-600 text-white text-2xl font-bold shadow-lg shadow-kebo-500/20"
          >
            K
          </Link>
          <h1 className="text-xl font-semibold text-dash-text mb-2">
            Welcome to Kebo
          </h1>
          <p className="text-dash-text-muted text-sm">
            Sign in to your account to continue
          </p>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3 mb-6">
          <button
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-dash-border bg-dash-card hover:bg-dash-card-hover transition-colors text-dash-text text-sm font-medium"
            onClick={() => handleOAuthLogin("google")}
            disabled={isLoading}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
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
            Continue with Google
          </button>
          <button
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-dash-border bg-dash-card hover:bg-dash-card-hover transition-colors text-dash-text text-sm font-medium"
            onClick={() => handleOAuthLogin("apple")}
            disabled={isLoading}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            Continue with Apple
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-dash-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-dash-card px-3 text-dash-text-dim">
              Or continue with email
            </span>
          </div>
        </div>

        {/* Email Auth Tabs */}
        <Tabs defaultValue="password" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-dash-bg border border-dash-border rounded-lg p-1 mb-4">
            <TabsTrigger
              value="password"
              className="rounded-md text-sm data-[state=active]:bg-dash-card data-[state=active]:text-dash-text text-dash-text-muted"
            >
              Password
            </TabsTrigger>
            <TabsTrigger
              value="magic-link"
              className="rounded-md text-sm data-[state=active]:bg-dash-card data-[state=active]:text-dash-text text-dash-text-muted"
            >
              Magic Link
            </TabsTrigger>
          </TabsList>

          {/* Email & Password Form */}
          <TabsContent value="password">
            <form onSubmit={handleEmailPassword} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="email-password"
                  className="text-dash-text-secondary text-sm"
                >
                  Email
                </Label>
                <Input
                  id="email-password"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="dash-input"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-dash-text-secondary text-sm"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={6}
                  className="dash-input"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1 bg-dash-accent hover:bg-dash-accent/90 text-white"
                  disabled={isLoading}
                  onClick={() => setAuthMode("signin")}
                >
                  {isLoading && authMode === "signin"
                    ? "Signing in..."
                    : "Sign In"}
                </Button>
                <Button
                  type="submit"
                  variant="outline"
                  className="flex-1 border-dash-border bg-dash-card hover:bg-dash-card-hover text-dash-text"
                  disabled={isLoading}
                  onClick={() => setAuthMode("signup")}
                >
                  {isLoading && authMode === "signup"
                    ? "Creating..."
                    : "Sign Up"}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Magic Link Form */}
          <TabsContent value="magic-link">
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="email-magic"
                  className="text-dash-text-secondary text-sm"
                >
                  Email
                </Label>
                <Input
                  id="email-magic"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="dash-input"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-dash-accent hover:bg-dash-accent/90 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send magic link"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {/* Terms */}
        <p className="text-center text-xs text-dash-text-dim mt-6">
          By continuing, you agree to our{" "}
          <Link
            href={`/${lang}/terms`}
            className="text-dash-accent hover:underline"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href={`/${lang}/privacy-policy`}
            className="text-dash-accent hover:underline"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
