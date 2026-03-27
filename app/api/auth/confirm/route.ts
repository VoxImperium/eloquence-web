import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"
import { verifyConfirmToken } from "@/lib/jwt-confirm"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token de confirmation manquant" },
        { status: 400 }
      )
    }

    // Verify JWT signature and expiration
    let decoded: { user_id?: string; email?: string }
    try {
      decoded = verifyConfirmToken(token)
    } catch (error) {
      console.error("JWT verification error:", error)
      return NextResponse.json(
        { success: false, error: "Lien de confirmation invalide ou expiré" },
        { status: 400 }
      )
    }

    const userId = decoded.user_id
    const userEmail = decoded.email

    if (!userId || !userEmail) {
      return NextResponse.json(
        { success: false, error: "Token invalide : données manquantes" },
        { status: 400 }
      )
    }

    // Use admin SDK to mark email as confirmed in Supabase
    const supabaseAdmin = createServiceClient()
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email_confirm: true,
    })

    if (error) {
      console.error("Email confirmation error:", error)
      return NextResponse.json(
        { success: false, error: "Erreur lors de la confirmation de l'email" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, email: userEmail })
  } catch (error) {
    console.error("Confirm endpoint error:", error)
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
