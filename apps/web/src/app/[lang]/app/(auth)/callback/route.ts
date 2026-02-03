import { createClient } from "@/lib/auth/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? ""

  // Extract lang from the URL path
  const pathname = new URL(request.url).pathname
  const langMatch = pathname.match(/^\/([a-z]{2})\//)
  const lang = langMatch ? langMatch[1] : "es"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host")
      const isLocalEnv = process.env.NODE_ENV === "development"

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}/${lang}/app${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}/${lang}/app${next}`)
      } else {
        return NextResponse.redirect(`${origin}/${lang}/app${next}`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/${lang}/app/auth/login?error=auth_error`)
}
