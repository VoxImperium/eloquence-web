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
