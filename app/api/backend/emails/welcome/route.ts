import { NextRequest, NextResponse } from "next/server"

function buildWelcomeEmail(prenom: string, email: string): string {
  const prenomDisplay = prenom ? `, ${prenom}` : ""
  const year = new Date().getFullYear()
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bienvenue sur Éloquence AI</title>
  <style>
    @media only screen and (max-width:600px) {
      .email-body { padding: 24px 16px !important; }
      .email-title { font-size: 26px !important; }
      .email-cta a { padding: 12px 20px !important; font-size: 12px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#0a0a0f;">
    <tr>
      <td align="center" style="padding:20px 12px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background:#0d0d14;border:1px solid rgba(201,168,76,0.2);">

          <!-- Header -->
          <tr>
            <td align="center" style="padding:40px 48px 32px;background:#0a0a0f;border-bottom:1px solid rgba(201,168,76,0.15);">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto 8px;">
                <tr>
                  <td align="center" style="padding:0;">
                    <!-- Icône microphone SVG -->
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto 12px;">
                      <rect x="14" y="2" width="8" height="16" rx="4" fill="#c9a84c"/>
                      <path d="M6 18 Q6 26 18 26 Q30 26 30 18" stroke="#c9a84c" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                      <line x1="18" y1="26" x2="18" y2="34" stroke="#c9a84c" stroke-width="2.4" stroke-linecap="round"/>
                      <line x1="10" y1="34" x2="26" y2="34" stroke="#c9a84c" stroke-width="2.4" stroke-linecap="round"/>
                    </svg>
                    <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:26px;font-weight:300;letter-spacing:0.12em;color:#f5f0e8;">Éloquence<span style="color:#c9a84c;font-style:italic;">.fr</span></p>
                    <p style="margin:0;font-size:10px;letter-spacing:0.35em;text-transform:uppercase;color:#6a6258;">Plateforme d&rsquo;excellence oratoire</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Gold rule -->
          <tr>
            <td style="padding:0;height:2px;background:linear-gradient(90deg,transparent,#c9a84c,transparent);"></td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="email-body" style="padding:48px 48px 40px;">

              <!-- Title -->
              <h1 class="email-title" style="margin:0 0 12px;font-family:Georgia,serif;font-size:36px;font-weight:300;color:#f5f0e8;letter-spacing:0.03em;">
                Bienvenue${prenomDisplay} ✦
              </h1>
              <p style="margin:0 0 32px;font-size:15px;color:#c9a84c;font-family:Georgia,serif;font-style:italic;letter-spacing:0.04em;">
                Votre voyage vers l&rsquo;excellence oratoire commence maintenant.
              </p>

              <!-- Welcome paragraph -->
              <p style="margin:0 0 32px;font-size:14px;line-height:1.8;color:#b0a898;letter-spacing:0.02em;">
                Nous sommes honor&eacute;s de vous accueillir au sein d&rsquo;<strong style="color:#f5f0e8;">Éloquence AI</strong> — la plateforme d&rsquo;entra&icirc;nement &agrave; l&rsquo;art de la parole. Vous avez d&eacute;sormais acc&egrave;s &agrave; des outils con&ccedil;us pour affiner votre voix, structurer vos discours et vous pr&eacute;parer aux situations les plus exigeantes.
              </p>

              <!-- Features box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid rgba(201,168,76,0.3);background:rgba(201,168,76,0.04);margin-bottom:36px;">
                <tr>
                  <td style="padding:28px 32px;">
                    <p style="margin:0 0 20px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#c9a84c;">Votre plan gratuit inclut</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding:6px 0;">
                          <span style="color:#c9a84c;margin-right:12px;">✦</span>
                          <span style="font-size:13px;color:#f5f0e8;letter-spacing:0.02em;">2 analyses vocales / mois</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;">
                          <span style="color:#c9a84c;margin-right:12px;">✦</span>
                          <span style="font-size:13px;color:#f5f0e8;letter-spacing:0.02em;">1 simulation d&rsquo;entretien / mois</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;">
                          <span style="color:#c9a84c;margin-right:12px;">✦</span>
                          <span style="font-size:13px;color:#f5f0e8;letter-spacing:0.02em;">20 sujets d&rsquo;entra&icirc;nement</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;">
                          <span style="color:#c9a84c;margin-right:12px;">✦</span>
                          <span style="font-size:13px;color:#f5f0e8;letter-spacing:0.02em;">1 analyse de discours / mois</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA button -->
              <table class="email-cta" role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:36px;">
                <tr>
                  <td style="background:#c9a84c;">
                    <a href="https://www.éloquence.fr/dashboard"
                       style="display:inline-block;padding:14px 32px;font-family:Arial,sans-serif;font-size:13px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#0a0a0f;text-decoration:none;">
                      Acc&eacute;der &agrave; mon espace &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Separator -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td style="height:1px;background:rgba(201,168,76,0.12);"></td>
                </tr>
              </table>

              <!-- Credentials -->
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#6a6258;">Vos identifiants de connexion :</p>
              <p style="margin:0 0 4px;font-size:13px;color:#f5f0e8;">
                <span style="color:#6a6258;">Email :</span> ${email}
              </p>
              <p style="margin:0;font-size:13px;color:#f5f0e8;">
                <span style="color:#6a6258;">Mot de passe :</span> celui que vous avez choisi &agrave; l&rsquo;inscription
              </p>

            </td>
          </tr>

          <!-- Gold rule -->
          <tr>
            <td style="padding:0;height:1px;background:rgba(201,168,76,0.12);"></td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:28px 48px;background:#0a0a0f;">
              <p style="margin:0 0 8px;font-size:12px;color:#6a6258;letter-spacing:0.04em;">&copy; ${year} &Eacute;loquence AI &mdash; Tous droits r&eacute;serv&eacute;s</p>
              <p style="margin:0 0 12px;">
                <a href="https://www.éloquence.fr" style="font-size:11px;color:#c9a84c;text-decoration:none;letter-spacing:0.06em;">www.éloquence.fr</a>
              </p>
              <p style="margin:0;font-size:10px;color:#3a3530;letter-spacing:0.03em;line-height:1.6;">
                Vous recevez cet email car vous venez de cr&eacute;er un compte sur &Eacute;loquence AI.
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
    const { email, prenom, phone } = await req.json()
    const apiKey = process.env.BREVO_API_KEY
    if (!apiKey) return NextResponse.json({ ok: false, error: "Missing API key" }, { status: 500 })

    // 1. Envoyer le mail de bienvenue HTML
    const emailHtml = buildWelcomeEmail(prenom || "", email)
    const emailRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { name: "Éloquence AI", email: "eloquenceaii@gmail.com" },
        to: [{ email, name: prenom || email }],
        subject: "Bienvenue sur Éloquence AI ✦",
        htmlContent: emailHtml,
      }),
    })
    if (!emailRes.ok) {
      const detail = await emailRes.json().catch(() => ({}))
      return NextResponse.json({ ok: false, error: "Email send failed", detail }, { status: 502 })
    }

    // 2. Ajouter le contact dans la liste Brevo #2
    const attributes: Record<string, string> = {}
    if (prenom) attributes.PRENOM = prenom
    if (phone) attributes.SMS = phone

    const contactRes = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        email,
        listIds: [2],
        updateEnabled: true,
        attributes,
      }),
    })
    if (!contactRes.ok) {
      const detail = await contactRes.json().catch(() => ({}))
      return NextResponse.json({ ok: false, error: "Contact creation failed", detail }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
