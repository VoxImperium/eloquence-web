import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// A new Supabase account created within this window is considered a first-time signup.
// The window is intentionally generous to account for slow OAuth round-trips.
const NEW_USER_DETECTION_WINDOW_MS = 30_000

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

      // Detect if this is a brand-new user (created_at ≈ now, within the detection window)
      const createdAt = new Date(user.created_at).getTime()
      const isNewUser = Date.now() - createdAt < NEW_USER_DETECTION_WINDOW_MS

      // Check if the user authenticated via Google OAuth
      const isGoogleAuth = user.app_metadata?.provider === "google"

      if (isNewUser && isGoogleAuth) {
        // Await the email so it completes before the serverless function exits
        try {
          await fetch(`${origin}/api/backend/emails/welcome-oauth`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email ?? "",
              prenom: user.user_metadata?.full_name ?? user.user_metadata?.name ?? "",
              provider: "google",
            }),
          })
        } catch (err) {
          // Log but do not block the login flow
          console.error("Failed to send OAuth welcome email:", err)
        }

        // Redirect to signup success page for new Google users
        return NextResponse.redirect(`${origin}/signup-success`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Auth failed — redirect to login with error hint
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
