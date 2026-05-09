import { NextResponse, type NextRequest } from "next/server"

import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") ?? "/dashboard"
  const oauthRole = request.cookies.get("oauth_role")?.value

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      const response = NextResponse.redirect(new URL("/login?error=callback", requestUrl.origin))
      response.cookies.delete("oauth_role")
      return response
    }

    if (oauthRole === "owner" || oauthRole === "renter") {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        await supabase.from("profiles").update({ role: oauthRole }).eq("id", user.id)
      }
    }
  }

  const response = NextResponse.redirect(new URL(next, requestUrl.origin))
  response.cookies.delete("oauth_role")
  return response
}
