import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import Stripe from "stripe"

function buildCancellationEmail(prenom: string, cancelAtDate: string): string {
  const year = new Date().getFullYear()
  const prenomDisplay = prenom || "Cher(e) abonné(e)"

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Fin d'abonnement – Éloquence AI</title>
  <style>
    @media only screen and (max-width:600px) {
      .email-body { padding: 24px 16px !important; }
      .email-title { font-size: 26px !important; }
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

              <h1 class="email-title" style="margin:0 0 12px;font-family:Georgia,serif;font-size:30px;font-weight:300;color:#f5f0e8;letter-spacing:0.03em;">
                Au revoir, ${prenomDisplay}&nbsp;✦
              </h1>

              <p style="margin:0 0 28px;font-size:14px;line-height:1.9;color:#b0a898;font-family:Georgia,serif;font-style:italic;letter-spacing:0.03em;">
                &laquo;&nbsp;Tout discours doit laisser une place au silence,<br/>
                comme toute m&eacute;lodie contient ses pauses.&nbsp;&raquo;
              </p>

              <p style="margin:0 0 28px;font-size:14px;line-height:1.8;color:#b0a898;letter-spacing:0.02em;">
                Votre abonnement &agrave; <strong style="color:#f5f0e8;">Éloquence AI</strong> a bien &eacute;t&eacute; r&eacute;sili&eacute;. Nous avons pris note de votre d&eacute;cision et nous la respectons pleinement.
              </p>

              <!-- Summary box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid rgba(201,168,76,0.3);background:rgba(201,168,76,0.04);margin-bottom:36px;">
                <tr>
                  <td style="padding:28px 32px;">
                    <p style="margin:0 0 16px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#c9a84c;">Ce que cela signifie pour vous</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding:7px 0;font-size:13px;color:#b0a898;line-height:1.7;">
                          <span style="color:#c9a84c;margin-right:10px;">✓</span>
                          Acc&egrave;s conserv&eacute; jusqu&rsquo;au&nbsp;: <strong style="color:#f5f0e8;">${cancelAtDate}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:7px 0;font-size:13px;color:#b0a898;line-height:1.7;">
                          <span style="color:#c9a84c;margin-right:10px;">✓</span>
                          Vos analyses et historiques restent accessibles jusqu&rsquo;&agrave; cette date
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:7px 0;font-size:13px;color:#b0a898;line-height:1.7;">
                          <span style="color:#c9a84c;margin-right:10px;">✓</span>
                          Aucun pr&eacute;l&egrave;vement suppl&eacute;mentaire ne sera effectu&eacute;
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:7px 0;font-size:13px;color:#b0a898;line-height:1.7;">
                          <span style="color:#c9a84c;margin-right:10px;">✓</span>
                          Apr&egrave;s cette date, votre compte basculera automatiquement en forfait gratuit
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Feedback -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid rgba(201,168,76,0.15);background:rgba(201,168,76,0.02);margin-bottom:36px;">
                <tr>
                  <td style="padding:24px 32px;">
                    <p style="margin:0 0 10px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#c9a84c;">Nous aimerions comprendre</p>
                    <p style="margin:0 0 16px;font-size:13px;color:#8a8070;line-height:1.7;">
                      Votre avis nous est pr&eacute;cieux pour am&eacute;liorer Éloquence AI. Si vous souhaitez partager la raison de votre d&eacute;part, nous vous en serions reconnaissants.
                    </p>
                    <a href="mailto:eloquenceaii@gmail.com?subject=Retour%20sur%20ma%20r%C3%A9siliation"
                       style="display:inline-block;padding:10px 24px;background:transparent;border:1px solid rgba(201,168,76,0.35);font-family:Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#c9a84c;text-decoration:none;">
                      Nous faire part de votre retour
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Come back CTA -->
              <p style="margin:0 0 20px;font-size:14px;line-height:1.8;color:#b0a898;letter-spacing:0.02em;">
                Si vous changez d&rsquo;avis, votre porte reste grande ouverte. Il vous suffit de visiter notre page des forfaits pour retrouver l&rsquo;acc&egrave;s complet &agrave; toutes vos fonctionnalit&eacute;s.
              </p>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:36px;">
                <tr>
                  <td style="background:#c9a84c;">
                    <a href="https://www.eloquence.fr/pricing"
                       style="display:inline-block;padding:14px 32px;font-family:Arial,sans-serif;font-size:13px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#0a0a0f;text-decoration:none;">
                      Revenir parmi nous &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#b0a898;font-family:Georgia,serif;font-style:italic;line-height:1.8;letter-spacing:0.02em;">
                &Agrave; bient&ocirc;t, pour un nouveau discours&nbsp;? 🎭<br/>
                <span style="color:#6a6258;font-style:normal;font-size:12px;">L&rsquo;&eacute;quipe Éloquence AI</span>
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
              <p style="margin:0 0 4px;font-size:12px;color:#6a6258;letter-spacing:0.04em;">&copy; ${year} Éloquence AI &mdash; Tous droits r&eacute;serv&eacute;s</p>
              <p style="margin:0 0 12px;">
                <a href="https://www.eloquence.fr" style="font-size:11px;color:#c9a84c;text-decoration:none;letter-spacing:0.06em;">www.eloquence.fr</a>
              </p>
              <p style="margin:0;font-size:10px;color:#3a3530;letter-spacing:0.03em;line-height:1.6;">
                Vous recevez cet email car vous avez r&eacute;sili&eacute; votre abonnement sur Éloquence AI.
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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const stripeKey = process.env.STRIPE_API_KEY
  const brevoApiKey = process.env.BREVO_API_KEY

  if (!supabaseUrl) {
    console.error("[CANCEL_SUBSCRIPTION] Missing NEXT_PUBLIC_SUPABASE_URL")
    return NextResponse.json({ ok: false, error: "Server configuration error - Missing Supabase URL" }, { status: 500 })
  }

  if (!supabaseAnonKey) {
    console.error("[CANCEL_SUBSCRIPTION] Missing NEXT_PUBLIC_SUPABASE_ANON_KEY")
    return NextResponse.json({ ok: false, error: "Server configuration error - Missing Supabase anon key" }, { status: 500 })
  }

  if (!supabaseServiceKey) {
    console.error("[CANCEL_SUBSCRIPTION] Missing SUPABASE_SERVICE_ROLE_KEY")
    return NextResponse.json({ ok: false, error: "Server configuration error - Missing admin key" }, { status: 500 })
  }

  if (!stripeKey) {
    console.error("[CANCEL_SUBSCRIPTION] Missing STRIPE_API_KEY")
    return NextResponse.json({ ok: false, error: "Server configuration error - Missing Stripe key" }, { status: 500 })
  }

  // Authenticate user via Bearer token
  const authHeader = req.headers.get("authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null

  if (!token) {
    return NextResponse.json({ ok: false, error: "Non authentifié" }, { status: 401 })
  }

  const supabaseUser = createClient(supabaseUrl, supabaseAnonKey)
  const { data: { user }, error: authError } = await supabaseUser.auth.getUser(token)

  if (authError || !user) {
    return NextResponse.json({ ok: false, error: "Token invalide ou expiré" }, { status: 401 })
  }

  const userId = user.id
  const userEmail = user.email

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

  // Fetch user profile to get stripe_customer_id and plan
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("plan, first_name, stripe_customer_id")
    .eq("id", userId)
    .single()

  if (profileError || !profile) {
    console.error(`[CANCEL_SUBSCRIPTION] Failed to fetch profile for user ${userId}:`, profileError)
    return NextResponse.json({ ok: false, error: "Profil introuvable" }, { status: 404 })
  }

  if (profile.plan === "free") {
    return NextResponse.json({ ok: false, error: "Aucun abonnement actif à résilier" }, { status: 400 })
  }

  if (!profile.stripe_customer_id) {
    console.error(`[CANCEL_SUBSCRIPTION] No stripe_customer_id for user ${userId}`)
    return NextResponse.json({ ok: false, error: "Aucun abonnement Stripe trouvé" }, { status: 404 })
  }

  const stripe = new Stripe(stripeKey)

  try {
    // List active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: "active",
      limit: 1,
    })

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ ok: false, error: "Aucun abonnement actif trouvé" }, { status: 404 })
    }

    const subscription = subscriptions.data[0]

    if (subscription.cancel_at_period_end) {
      const cancelAt = new Date((subscription.cancel_at ?? 0) * 1000)
      const dateStr = subscription.cancel_at
        ? cancelAt.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
        : "la fin de la période en cours"
      return NextResponse.json({
        ok: false,
        error: `Abonnement déjà en cours de résiliation le ${dateStr}`,
      }, { status: 400 })
    }

    // Cancel at end of current period
    const updated = await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
    })

    const cancelAt = new Date((updated.cancel_at ?? 0) * 1000)
    const cancelAtFormatted = updated.cancel_at
      ? cancelAt.toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "la fin de la période en cours"

    console.log(`[CANCEL_SUBSCRIPTION] Subscription ${subscription.id} set to cancel at period end for user ${userId}`)

    // Send cancellation email (non-blocking — best effort)
    if (brevoApiKey && userEmail) {
      try {
        const emailHtml = buildCancellationEmail(profile.first_name || "", cancelAtFormatted)
        await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: { "Content-Type": "application/json", "api-key": brevoApiKey },
          body: JSON.stringify({
            sender: { name: "Éloquence AI", email: "eloquenceaii@gmail.com" },
            to: [{ email: userEmail, name: profile.first_name || userEmail }],
            subject: "Votre abonnement Éloquence AI a été résilié",
            htmlContent: emailHtml,
          }),
        })
      } catch (e) {
        console.error(`[CANCEL_SUBSCRIPTION] Cancellation email failed for ${userEmail}:`, e)
        // Non-fatal: continue
      }
    }

    return NextResponse.json({
      ok: true,
      message: `Abonnement résilié — accès conservé jusqu'au ${cancelAtFormatted}`,
      cancelAt: updated.cancel_at ? new Date(updated.cancel_at * 1000).toISOString() : null,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur inconnue"
    console.error(`[CANCEL_SUBSCRIPTION] Stripe error for user ${userId}:`, err)
    return NextResponse.json({ ok: false, error: `Erreur Stripe : ${message}` }, { status: 500 })
  }
}
