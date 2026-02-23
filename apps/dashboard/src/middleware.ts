import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const code = request.nextUrl.searchParams.get("code")

  console.log("[Middleware]", request.nextUrl.pathname, code ? `code=${code.slice(0, 8)}...` : "no code")

  // If an auth code arrives, exchange it for a session right here
  if (code && request.nextUrl.pathname.startsWith("/app")) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    console.log("[Middleware] Exchange result:", error ? error.message : "success")

    const url = request.nextUrl.clone()
    url.searchParams.delete("code")
    url.pathname = error ? "/app/login" : "/app"

    // Copy session cookies with their full options onto the redirect
    const redirectResponse = NextResponse.redirect(url)
    response.cookies.getAll().forEach(({ name, value, ...options }) => {
      redirectResponse.cookies.set(name, value, options)
    })
    return redirectResponse
  }

  // Refresh the session for all other requests
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
