import { NextRequest, NextResponse } from "next/server"

type Plan = "basique" | "illimite"

const PLAN_LABELS: Record<Plan, string> = {
  basique:  "Forfait Basique",
  illimite: "Forfait Illimité",
}

const PLAN_PRICES: Record<Plan, string> = {
  basique:  "7,99 €",
  illimite: "15,99 €",
}

function buildOrderConfirmationEmail(
  prenom: string,
  email: string,
  plan: Plan,
  startDate: string,
): string {
  const prenomDisplay = prenom || "Cher(e) client(e)"
  const year = new Date().getFullYear()
  const planLabel = PLAN_LABELS[plan]
  const planPrice = PLAN_PRICES[plan]

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirmation de commande – Éloquence AI</title>
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

          <!-- Gold rule -->
          <tr>
            <td style="padding:0;height:2px;background:linear-gradient(90deg,transparent,#c9a84c,transparent);"></td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="email-body" style="padding:48px 48px 40px;">

              <!-- Title -->
              <h1 class="email-title" style="margin:0 0 12px;font-family:Georgia,serif;font-size:32px;font-weight:300;color:#f5f0e8;letter-spacing:0.03em;">
                Bonjour ${prenomDisplay} ✦
              </h1>
              <p style="margin:0 0 32px;font-size:15px;color:#c9a84c;font-family:Georgia,serif;font-style:italic;letter-spacing:0.04em;">
                C&rsquo;est un plaisir de vous compter parmi nous&nbsp;!
              </p>

              <p style="margin:0 0 32px;font-size:14px;line-height:1.8;color:#b0a898;letter-spacing:0.02em;">
                Votre abonnement &agrave; <strong style="color:#f5f0e8;">Éloquence AI</strong> est d&eacute;sormais actif. Vous avez maintenant toutes les cl&eacute;s en main pour perfectionner vos plaidoiries et vos prises de parole.
              </p>

              <!-- Subscription summary -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid rgba(201,168,76,0.3);background:rgba(201,168,76,0.04);margin-bottom:36px;">
                <tr>
                  <td style="padding:28px 32px;">
                    <p style="margin:0 0 20px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#c9a84c;">📝 Récapitulatif de votre abonnement</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#6a6258;width:50%;">Offre souscrite :</td>
                        <td style="padding:6px 0;font-size:13px;color:#f5f0e8;">${planLabel}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#6a6258;">Montant :</td>
                        <td style="padding:6px 0;font-size:13px;color:#f5f0e8;">${planPrice} TTC par mois</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#6a6258;">Date de début :</td>
                        <td style="padding:6px 0;font-size:13px;color:#f5f0e8;">${startDate}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#6a6258;">Moyen de paiement :</td>
                        <td style="padding:6px 0;font-size:13px;color:#f5f0e8;">Carte bancaire via Stripe</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Legal information -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid rgba(201,168,76,0.15);background:rgba(201,168,76,0.02);margin-bottom:36px;">
                <tr>
                  <td style="padding:28px 32px;">
                    <p style="margin:0 0 16px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#c9a84c;">⚖️ Informations Légales</p>
                    <p style="margin:0 0 8px;font-size:11px;color:#6a6258;line-height:1.7;letter-spacing:0.02em;">
                      Conform&eacute;ment &agrave; nos CGUV que vous avez accept&eacute;es lors de votre souscription :
                    </p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding:6px 0 6px 12px;font-size:12px;color:#b0a898;line-height:1.7;border-left:2px solid rgba(201,168,76,0.3);">
                          <strong style="color:#f5f0e8;">Ex&eacute;cution imm&eacute;diate :</strong> Vous avez expressément demand&eacute; l&rsquo;acc&egrave;s imm&eacute;diat aux services de la plateforme et avez ainsi renonc&eacute; &agrave; votre droit de r&eacute;tractation de 14 jours.
                        </td>
                      </tr>
                      <tr><td style="height:8px;"></td></tr>
                      <tr>
                        <td style="padding:6px 0 6px 12px;font-size:12px;color:#b0a898;line-height:1.7;border-left:2px solid rgba(201,168,76,0.3);">
                          <strong style="color:#f5f0e8;">Sans engagement :</strong> Vous pouvez r&eacute;silier votre abonnement &agrave; tout moment depuis votre espace personnel. La r&eacute;siliation prendra effet &agrave; la fin de la p&eacute;riode mensuelle en cours.
                        </td>
                      </tr>
                      <tr><td style="height:8px;"></td></tr>
                      <tr>
                        <td style="padding:6px 0 6px 12px;font-size:12px;color:#b0a898;line-height:1.7;border-left:2px solid rgba(201,168,76,0.3);">
                          <strong style="color:#f5f0e8;">Nature du service :</strong> Nous vous rappelons qu&rsquo;&Eacute;loquence AI est un outil d&rsquo;assistance par IA. Il ne remplace en aucun cas un conseil juridique ou professionnel.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Next steps -->
              <p style="margin:0 0 16px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#c9a84c;">🚀 Prochaines étapes</p>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.8;color:#b0a898;letter-spacing:0.02em;">
                Vous pouvez d&egrave;s &agrave; pr&eacute;sent acc&eacute;der &agrave; votre tableau de bord et commencer vos premi&egrave;res analyses :
              </p>

              <!-- CTA button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="email-cta" style="margin-bottom:36px;">
                <tr>
                  <td style="background:#c9a84c;">
                    <a href="https://www.eloquence.fr/dashboard"
                       style="display:inline-block;padding:14px 32px;font-family:Arial,sans-serif;font-size:13px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#0a0a0f;text-decoration:none;">
                      Acc&eacute;der &agrave; mon espace &Eacute;loquence AI &rarr;
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

              <p style="margin:0;font-size:12px;color:#6a6258;line-height:1.8;letter-spacing:0.02em;">
                Votre facture est disponible en pi&egrave;ce jointe de cet email ou consultable directement dans votre espace client.<br/>
                Si vous avez la moindre question, n&rsquo;h&eacute;sitez pas &agrave; nous contacter &agrave; :
                <a href="mailto:eloquenceaii@gmail.com" style="color:#c9a84c;text-decoration:none;">eloquenceaii@gmail.com</a>
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
              <p style="margin:0 0 4px;font-size:12px;color:#6a6258;letter-spacing:0.04em;">L&rsquo;&eacute;quipe &Eacute;loquence AI</p>
              <p style="margin:0 0 8px;font-size:12px;color:#6a6258;letter-spacing:0.04em;">&copy; ${year} &Eacute;loquence AI &mdash; Tous droits r&eacute;serv&eacute;s</p>
              <p style="margin:0 0 12px;">
                <a href="https://www.eloquence.fr" style="font-size:11px;color:#c9a84c;text-decoration:none;letter-spacing:0.06em;">www.eloquence.fr</a>
              </p>
              <p style="margin:0;font-size:10px;color:#3a3530;letter-spacing:0.03em;line-height:1.6;">
                Vous recevez cet email car vous venez de souscrire un abonnement sur &Eacute;loquence AI.
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
    const { email, prenom, plan, startDate } = await req.json()

    if (!email || !plan || !["basique", "illimite"].includes(plan)) {
      return NextResponse.json({ ok: false, error: "Paramètres invalides." }, { status: 400 })
    }

    const apiKey = process.env.BREVO_API_KEY
    if (!apiKey) return NextResponse.json({ ok: false, error: "Missing API key" }, { status: 500 })

    const formattedDate = startDate || new Date().toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })

    const emailHtml = buildOrderConfirmationEmail(prenom || "", email, plan as Plan, formattedDate)

    const emailRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": apiKey },
      body: JSON.stringify({
        sender: { name: "Éloquence AI", email: "eloquenceaii@gmail.com" },
        to: [{ email, name: prenom || email }],
        subject: "Bienvenue chez Éloquence AI 🎙️ – Confirmation de votre abonnement",
        htmlContent: emailHtml,
      }),
    }).catch(e => { console.error("Brevo email fetch error:", e); return null })

    if (!emailRes || !emailRes.ok) {
      const detail = await emailRes?.json().catch(() => ({}))
      console.error("Brevo order confirmation email send failed:", detail)
    }

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
