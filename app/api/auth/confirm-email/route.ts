import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/login?error=no-token`
      )
    }

    // Verify the JWT
    let decoded: { user_id?: string; email?: string }
    try {
      const jwtSecret = process.env.JWT_SECRET
      if (!jwtSecret) {
        console.error("JWT_SECRET environment variable is not set")
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_SITE_URL}/login?error=server-error`
        )
      }
      decoded = jwt.verify(token, jwtSecret) as {
        user_id?: string
        email?: string
      }
    } catch (error) {
      console.error("JWT verification error:", error)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/login?error=invalid-token`
      )
    }

    const userId = decoded.user_id
    const userEmail = decoded.email

    if (!userId || !userEmail) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/login?error=invalid-token`
      )
    }

    // Use admin SDK to mark email as confirmed
    const supabaseAdmin = createServiceClient()
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email_confirm: true,
    })

    if (error) {
      console.error("Email confirmation error:", error)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/login?error=confirmation-failed`
      )
    }

    // ✅ Email confirmé avec succès
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/login?confirmed=true&email=${encodeURIComponent(userEmail)}`
    )
  } catch (error) {
    console.error("Confirm email error:", error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/login?error=confirmation-error`
    )
  }
}
