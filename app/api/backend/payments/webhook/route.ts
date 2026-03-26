import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const PRICE_TO_PLAN: Record<string, string> = {
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIQUE ?? ""]: "basique",
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_ILLIMITE ?? ""]: "illimite",
}

function getPlanFromPriceId(priceId: string): string | null {
  return PRICE_TO_PLAN[priceId] ?? null
}

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_API_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })
  }

  const stripe = new Stripe(stripeKey)
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const sig = req.headers.get("stripe-signature")
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    const rawBody = await req.text()
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("Webhook signature verification failed:", message)
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.user_id
      let plan: string | null = null

      // Try to determine plan from metadata price_id first
      if (session.metadata?.price_id) {
        plan = getPlanFromPriceId(session.metadata.price_id)
      }

      // Fall back to retrieving line items from Stripe (line_items not expanded by default)
      if (!plan && session.id) {
        try {
          const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ["line_items"],
          })
          const lineItemPriceId = fullSession.line_items?.data?.[0]?.price?.id
          if (lineItemPriceId) {
            plan = getPlanFromPriceId(lineItemPriceId)
          }
        } catch (e) {
          console.error("Failed to retrieve session line items:", e)
        }
      }

      if (!userId) {
        console.error("checkout.session.completed: missing user_id in metadata")
        return NextResponse.json({ received: true })
      }

      if (!plan) {
        console.error("checkout.session.completed: could not determine plan from price_id", session.metadata?.price_id)
        return NextResponse.json({ received: true })
      }

      const { error } = await supabase
        .from("profiles")
        .update({ plan })
        .eq("id", userId)

      if (error) {
        console.error("Supabase update plan error:", error)
        return NextResponse.json({ error: "Failed to update plan" }, { status: 500 })
      }

      console.log(`Updated user ${userId} to plan ${plan}`)
    } else if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as Stripe.Invoice
      const customerEmail = invoice.customer_email
      const invoiceNumber = invoice.number ?? invoice.id
      const amountPaid = invoice.amount_paid
      const currency = invoice.currency.toUpperCase()
      const invoicePdfUrl = invoice.invoice_pdf
      const periodStart = invoice.period_start
        ? new Date(invoice.period_start * 1000).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
        : null
      const periodEnd = invoice.period_end
        ? new Date(invoice.period_end * 1000).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
        : null
      const invoiceDate = invoice.created
        ? new Date(invoice.created * 1000).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
        : new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })

      const amountFormatted = amountPaid
        ? `${(amountPaid / 100).toFixed(2).replace(".", ",")} ${currency === "EUR" ? "€" : currency}`
        : null

      const brevoApiKey = process.env.BREVO_API_KEY

      if (customerEmail && brevoApiKey && amountPaid && amountPaid > 0) {
        // Fetch customer name from Supabase if possible
        let prenom = ""
        try {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("first_name")
            .eq("stripe_customer_id", invoice.customer as string)
            .limit(1)
          prenom = profiles?.[0]?.first_name ?? ""
        } catch (e) {
          console.error("Failed to fetch profile for invoice email:", e)
        }

        const year = new Date().getFullYear()
        const prenomDisplay = prenom || "Cher(e) client(e)"

        const emailHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Facture – Éloquence AI</title>
  <style>
    @media only screen and (max-width:600px) {
      .email-body { padding: 24px 16px !important; }
      .email-title { font-size: 24px !important; }
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

              <h1 class="email-title" style="margin:0 0 8px;font-family:Georgia,serif;font-size:28px;font-weight:300;color:#f5f0e8;letter-spacing:0.03em;">
                Votre facture ✦
              </h1>
              <p style="margin:0 0 32px;font-size:14px;color:#c9a84c;font-family:Georgia,serif;font-style:italic;letter-spacing:0.04em;">
                Bonjour ${prenomDisplay}, merci de votre confiance&nbsp;!
              </p>

              <!-- Invoice meta -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid rgba(201,168,76,0.3);background:rgba(201,168,76,0.04);margin-bottom:32px;">
                <tr>
                  <td style="padding:28px 32px;">
                    <p style="margin:0 0 20px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#c9a84c;">Détails de la facture</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      ${invoiceNumber ? `<tr>
                        <td style="padding:6px 0;font-size:13px;color:#6a6258;width:50%;">Numéro de facture :</td>
                        <td style="padding:6px 0;font-size:13px;color:#f5f0e8;">${invoiceNumber}</td>
                      </tr>` : ""}
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#6a6258;">Date de facturation :</td>
                        <td style="padding:6px 0;font-size:13px;color:#f5f0e8;">${invoiceDate}</td>
                      </tr>
                      ${periodStart && periodEnd ? `<tr>
                        <td style="padding:6px 0;font-size:13px;color:#6a6258;">Période :</td>
                        <td style="padding:6px 0;font-size:13px;color:#f5f0e8;">${periodStart} – ${periodEnd}</td>
                      </tr>` : ""}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Amount -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid rgba(201,168,76,0.3);background:rgba(201,168,76,0.04);margin-bottom:32px;">
                <tr>
                  <td style="padding:28px 32px;">
                    <p style="margin:0 0 20px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#c9a84c;">Récapitulatif</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#6a6258;border-bottom:1px solid rgba(201,168,76,0.1);">Abonnement Éloquence AI</td>
                        <td style="padding:6px 0;font-size:13px;color:#f5f0e8;text-align:right;border-bottom:1px solid rgba(201,168,76,0.1);">${amountFormatted}</td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0 0;font-size:14px;font-weight:600;color:#f5f0e8;">Total TTC</td>
                        <td style="padding:10px 0 0;font-size:16px;font-weight:300;color:#c9a84c;text-align:right;font-family:Georgia,serif;">${amountFormatted}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${invoicePdfUrl ? `<!-- PDF download -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:36px;">
                <tr>
                  <td style="background:#c9a84c;">
                    <a href="${invoicePdfUrl}"
                       style="display:inline-block;padding:14px 32px;font-family:Arial,sans-serif;font-size:13px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#0a0a0f;text-decoration:none;">
                      Télécharger la facture PDF →
                    </a>
                  </td>
                </tr>
              </table>` : ""}

              <!-- Separator -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td style="height:1px;background:rgba(201,168,76,0.12);"></td>
                </tr>
              </table>

              <p style="margin:0;font-size:12px;color:#6a6258;line-height:1.8;letter-spacing:0.02em;">
                Pour toute question concernant cette facture, contactez-nous à&nbsp;:
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
              <p style="margin:0 0 4px;font-size:12px;color:#6a6258;letter-spacing:0.04em;">L&rsquo;&eacute;quipe Éloquence AI</p>
              <p style="margin:0 0 8px;font-size:12px;color:#6a6258;letter-spacing:0.04em;">&copy; ${year} Éloquence AI &mdash; Tous droits réservés</p>
              <p style="margin:0 0 12px;">
                <a href="https://www.eloquence.fr" style="font-size:11px;color:#c9a84c;text-decoration:none;letter-spacing:0.06em;">www.eloquence.fr</a>
              </p>
              <p style="margin:0;font-size:10px;color:#3a3530;letter-spacing:0.03em;line-height:1.6;">
                Vous recevez cet email suite à un paiement effectué sur Éloquence AI.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

        try {
          await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: { "Content-Type": "application/json", "api-key": brevoApiKey },
            body: JSON.stringify({
              sender: { name: "Éloquence AI", email: "eloquenceaii@gmail.com" },
              to: [{ email: customerEmail, name: prenom || customerEmail }],
              subject: `Votre facture Éloquence AI – ${invoiceDate}`,
              htmlContent: emailHtml,
            }),
          })
          console.log(`[INVOICE_EMAIL] Sent invoice email to ${customerEmail} for invoice ${invoiceNumber}`)
        } catch (e) {
          console.error(`[INVOICE_EMAIL] Failed to send invoice email to ${customerEmail}:`, e)
          // Non-fatal: log and continue
        }
      }
    } else if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      // Find user by Stripe customer ID
      const { data: profiles, error: fetchError } = await supabase
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .limit(1)

      if (fetchError) {
        console.error("Supabase fetch profile error:", fetchError)
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
      }

      const profile = profiles?.[0]
      if (profile) {
        const { error } = await supabase
          .from("profiles")
          .update({ plan: "free" })
          .eq("id", profile.id)

        if (error) {
          console.error("Supabase reset plan error:", error)
          return NextResponse.json({ error: "Failed to reset plan" }, { status: 500 })
        }

        console.log(`Reset user ${profile.id} to free plan after subscription deletion`)
      } else {
        console.warn("customer.subscription.deleted: no profile found for customer", customerId)
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
