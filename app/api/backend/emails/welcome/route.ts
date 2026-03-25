import { NextRequest, NextResponse } from "next/server"

function buildWelcomeHtml(email: string, prenom?: string): string {
  const greeting = prenom ? `, ${prenom}` : ""
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Bienvenue sur Éloquence AI</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0a0a0f;">
  <tr>
    <td align="center" style="padding:40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

        <!-- HEADER -->
        <tr>
          <td style="background:#0a0a0f;padding:40px 40px 32px;text-align:center;">
            <p style="margin:0;font-family:Georgia,serif;font-size:28px;font-weight:400;color:#ffffff;letter-spacing:0.05em;">
              Éloquence<span style="color:#c9a84c;font-style:italic;">.ai</span>
            </p>
            <p style="margin:12px 0 0;font-size:18px;color:#c9a84c;">✦</p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
              <tr><td style="border-bottom:1px solid rgba(201,168,76,0.3);font-size:0;line-height:0;">&nbsp;</td></tr>
            </table>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="background:#0d0d14;padding:48px 48px 40px;">
            <h1 style="margin:0 0 12px;font-family:Georgia,serif;font-size:36px;font-weight:300;color:#f5f0e8;letter-spacing:0.02em;">
              Bienvenue${greeting}
            </h1>
            <p style="margin:0 0 32px;font-family:Georgia,serif;font-size:16px;font-style:italic;color:#c9a84c;line-height:1.5;">
              Votre voyage vers l&apos;excellence oratoire commence maintenant.
            </p>
            <p style="margin:0 0 32px;font-family:Arial,sans-serif;font-size:15px;color:#f5f0e8;line-height:1.7;">
              Nous sommes honorés de vous accueillir au sein d&apos;Éloquence&nbsp;AI — la plateforme d&apos;entraînement à l&apos;art de la parole. Vous disposez désormais d&apos;outils conçus pour affiner votre voix, structurer vos discours et vous préparer aux situations les plus exigeantes.
            </p>

            <!-- Encadré accès gratuit -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
              style="border:1px solid rgba(201,168,76,0.25);background:rgba(201,168,76,0.04);margin:0 0 32px;">
              <tr>
                <td style="padding:24px 28px;">
                  <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#c9a84c;letter-spacing:0.2em;text-transform:uppercase;">
                    Votre accès Gratuit inclut&nbsp;:
                  </p>
                  <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:14px;color:#f5f0e8;line-height:1.8;">
                    ✦&nbsp; 2 analyses vocales / mois
                  </p>
                  <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:14px;color:#f5f0e8;line-height:1.8;">
                    ✦&nbsp; 1 simulation d&apos;entretien / mois
                  </p>
                  <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:14px;color:#f5f0e8;line-height:1.8;">
                    ✦&nbsp; 20 sujets d&apos;entraînement
                  </p>
                  <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:#f5f0e8;line-height:1.8;">
                    ✦&nbsp; 1 analyse de discours / mois
                  </p>
                </td>
              </tr>
            </table>

            <!-- CTA Button -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 32px;">
              <tr>
                <td align="center">
                  <a href="https://xn--loquence-90a.fr/dashboard"
                    style="display:inline-block;background:#c9a84c;color:#0a0a0f;text-decoration:none;padding:14px 40px;font-family:Arial,sans-serif;font-size:13px;letter-spacing:0.1em;font-weight:600;">
                    Accéder à mon espace →
                  </a>
                </td>
              </tr>
            </table>

            <!-- Separator -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 32px;">
              <tr><td style="border-bottom:1px solid rgba(201,168,76,0.2);font-size:0;line-height:0;">&nbsp;</td></tr>
            </table>

            <!-- Identifiants -->
            <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#c9a84c;letter-spacing:0.2em;text-transform:uppercase;">
              Vos identifiants de connexion
            </p>
            <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:14px;color:#f5f0e8;line-height:1.6;">
              Email&nbsp;: ${email}
            </p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:#8a8278;line-height:1.6;">
              Mot de passe&nbsp;: celui choisi à l&apos;inscription
            </p>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#0a0a0f;padding:32px 40px;text-align:center;">
            <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:12px;color:#8a8278;letter-spacing:0.04em;">
              © 2025 Éloquence AI — Tous droits réservés
            </p>
            <p style="margin:0 0 12px;">
              <a href="https://xn--loquence-90a.fr"
                style="font-family:Arial,sans-serif;font-size:12px;color:#c9a84c;text-decoration:none;">
                xn--loquence-90a.fr
              </a>
            </p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#6a6258;line-height:1.5;">
              Vous recevez cet email car vous venez de créer un compte sur Éloquence AI.
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, prenom, phone } = body as { email: string; prenom?: string; phone?: string }

    const apiKey = process.env.BREVO_API_KEY
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: "BREVO_API_KEY not configured" }, { status: 500 })
    }

    const sender = { name: "Éloquence AI", email: "eloquenceaii@gmail.com" }

    // 1. Send welcome email
    const emailRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender,
        to: [{ email }],
        subject: "Bienvenue sur Éloquence AI ✦",
        htmlContent: buildWelcomeHtml(email, prenom),
      }),
    })

    if (!emailRes.ok) {
      const errText = await emailRes.text().catch(() => "")
      console.error("Brevo email error:", errText)
      return NextResponse.json({ ok: false, error: "Failed to send email" }, { status: 500 })
    }

    // 2. Add contact to Brevo list #2
    const attributes: Record<string, string> = {}
    if (prenom) attributes.FIRSTNAME = prenom
    if (phone) attributes.SMS = phone

    await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({ email, listIds: [2], attributes }),
    }).catch((err) => console.error("Brevo contact error:", err))

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
