import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { email, password, prenom, phone } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et password requis" },
        { status: 400 }
      )
    }

    // Use admin SDK to create user without email confirmation so Supabase
    // does NOT send its own confirmation email — Brevo sends the welcome email
    // with a JWT-based confirmation link instead.
    const supabaseAdmin = createServiceClient()

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        full_name: prenom || "",
        phone: phone || "",
      },
    })

    if (error) {
      console.error("Signup error:", error)
      return NextResponse.json(
        { error: error.message || "Erreur création compte" },
        { status: 400 }
      )
    }

    const user = data.user

    // Send Brevo welcome email (only email the user receives)
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.xn--loquence-90a.fr"
      const emailRes = await fetch(`${siteUrl}/api/backend/emails/welcome`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email || "",
          prenom: prenom || user.user_metadata?.full_name || "",
          phone: phone || "",
          userId: user.id,
          plan: "free",
        }),
      })
      if (!emailRes.ok) {
        const detail = await emailRes.json().catch(() => ({}))
        console.error("Welcome email failed:", emailRes.status, detail)
      }
    } catch (e) {
      console.error("Welcome email error:", e)
      // Do not block signup if email sending fails
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
        },
        message: "Compte créé ! Vérifiez votre email.",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Signup endpoint error:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
