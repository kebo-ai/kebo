import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? ""

  // Extract lang from the URL path
  const pathname = new URL(request.url).pathname
  const langMatch = pathname.match(/^\/([a-z]{2})\//)
  const lang = langMatch ? langMatch[1] : "es"

  console.log("[Auth Callback] Received request:", {
    pathname,
    code: code ? `${code.substring(0, 8)}...` : null,
    origin,
    lang,
  })

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    console.log("[Auth Callback] Exchange result:", {
      success: !error,
      error: error?.message,
      userId: data?.user?.id,
    })

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
  return NextResponse.redirect(`${origin}/${lang}/app/login?error=auth_error`)
}
