import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const brevoApiKey = process.env.BREVO_API_KEY

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    return NextResponse.json({ ok: false, error: "Server configuration error" }, { status: 500 })
  }

  // Authenticate user via Bearer token
  const authHeader = req.headers.get("authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null

  if (!token) {
    return NextResponse.json({ ok: false, error: "Non authentifié" }, { status: 401 })
  }

  // Verify user identity with their JWT
  const supabaseUser = createClient(supabaseUrl, supabaseAnonKey)
  const { data: { user }, error: authError } = await supabaseUser.auth.getUser(token)

  if (authError || !user) {
    return NextResponse.json({ ok: false, error: "Token invalide ou expiré" }, { status: 401 })
  }

  const userId = user.id
  const userEmail = user.email

  // Admin client for privileged operations (server-side only)
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // 1. Delete all analysis sessions
    const { error: sessionsError } = await supabaseAdmin
      .from("analysis_sessions")
      .delete()
      .eq("user_id", userId)

    if (sessionsError) {
      console.error(`[DELETE_ACCOUNT] Failed to delete sessions for user ${userId}:`, sessionsError)
      return NextResponse.json({ ok: false, error: "Erreur lors de la suppression des données" }, { status: 500 })
    }

    // 2. Delete user profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId)

    if (profileError) {
      console.error(`[DELETE_ACCOUNT] Failed to delete profile for user ${userId}:`, profileError)
      return NextResponse.json({ ok: false, error: "Erreur lors de la suppression du profil" }, { status: 500 })
    }

    // 3. Delete Brevo contact (non-blocking — best effort)
    if (brevoApiKey && userEmail) {
      try {
        await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(userEmail)}`, {
          method: "DELETE",
          headers: { "api-key": brevoApiKey },
        })
      } catch (e) {
        console.error(`[DELETE_ACCOUNT] Brevo contact deletion failed for ${userEmail}:`, e)
        // Non-fatal: continue with account deletion
      }
    }

    // 4. Send deletion confirmation email (non-blocking — best effort)
    if (brevoApiKey && userEmail) {
      try {
        const year = new Date().getFullYear()
        await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: { "Content-Type": "application/json", "api-key": brevoApiKey },
          body: JSON.stringify({
            sender: { name: "Éloquence AI", email: "eloquenceaii@gmail.com" },
            to: [{ email: userEmail }],
            subject: "Confirmation de suppression de votre compte Éloquence AI",
            htmlContent: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#0a0a0f;">
    <tr><td align="center" style="padding:20px 12px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background:#0d0d14;border:1px solid rgba(201,168,76,0.2);">
        <tr><td align="center" style="padding:40px 48px 32px;background:#0a0a0f;border-bottom:1px solid rgba(201,168,76,0.15);">
          <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:26px;font-weight:300;letter-spacing:0.12em;color:#f5f0e8;">Éloquence<span style="color:#c9a84c;font-style:italic;">.ai</span></p>
        </td></tr>
        <tr><td style="padding:0;height:2px;background:linear-gradient(90deg,transparent,#c9a84c,transparent);"></td></tr>
        <tr><td style="padding:48px 48px 40px;">
          <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:28px;font-weight:300;color:#f5f0e8;">Compte supprimé</h1>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.8;color:#8a8070;">
            Votre compte Éloquence AI et l'ensemble de vos données personnelles (profil, analyses, historiques) ont été supprimés conformément à votre demande et à l'Article 17 du RGPD.
          </p>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.8;color:#8a8070;">
            <strong style="color:#f5f0e8;">Note :</strong> Les factures liées à vos abonnements sont conservées 6 ans conformément aux obligations légales françaises (Code du Commerce).
          </p>
          <p style="margin:0;font-size:13px;color:#6a6258;">
            Si vous n'êtes pas à l'origine de cette demande, contactez-nous immédiatement à <a href="mailto:eloquenceaii@gmail.com" style="color:#c9a84c;text-decoration:none;">eloquenceaii@gmail.com</a>.
          </p>
        </td></tr>
        <tr><td align="center" style="padding:28px 48px;background:#0a0a0f;">
          <p style="margin:0;font-size:12px;color:#6a6258;">&copy; ${year} Éloquence AI — Tous droits réservés</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
          }),
        })
      } catch (e) {
        console.error(`[DELETE_ACCOUNT] Confirmation email failed for ${userEmail}:`, e)
        // Non-fatal: continue
      }
    }

    // 5. Delete Supabase auth user (must be last step)
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteUserError) {
      console.error(`[DELETE_ACCOUNT] Failed to delete auth user ${userId}:`, deleteUserError)
      return NextResponse.json({ ok: false, error: "Erreur lors de la suppression du compte d'authentification" }, { status: 500 })
    }

    console.log(`[DELETE_ACCOUNT] User ${userId} deleted at ${new Date().toISOString()}`)

    return NextResponse.json({
      ok: true,
      message: "Compte supprimé avec succès. Toutes vos données ont été effacées conformément au RGPD (Art. 17).",
    })
  } catch (err) {
    console.error(`[DELETE_ACCOUNT] Unexpected error for user ${userId}:`, err)
    return NextResponse.json({ ok: false, error: "Erreur interne du serveur" }, { status: 500 })
  }
}
