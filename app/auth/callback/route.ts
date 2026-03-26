import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const NEW_USER_DETECTION_WINDOW_MS = 10_000

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code  = searchParams.get("code")
  const next  = searchParams.get("next") ?? "/dashboard"

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll()         { return cookieStore.getAll() },
          setAll(list)     { list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const user = data.user
      // Detect if this is a brand-new user (created_at ≈ now, within 10 seconds)
      const createdAt = new Date(user.created_at).getTime()
      const isNewUser = Date.now() - createdAt < NEW_USER_DETECTION_WINDOW_MS

      if (isNewUser) {
        // Fire-and-forget welcome email
        fetch(`${origin}/api/backend/emails/welcome`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email ?? "",
            prenom: user.user_metadata?.full_name ?? user.user_metadata?.name ?? "",
            phone: "",
          }),
        }).catch((err) => console.error("Failed to send welcome email:", err))

        // Redirect to signup success page for new Google users
        return NextResponse.redirect(`${origin}/signup-success`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Auth failed — redirect to login with error hint
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
