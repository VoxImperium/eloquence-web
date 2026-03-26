import { NextRequest, NextResponse } from "next/server"

const ALLOWED_PRICE_IDS = new Set(
  [
    process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIQUE,
    process.env.NEXT_PUBLIC_STRIPE_PRICE_ILLIMITE,
  ].filter(Boolean)
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { price_id, user_id, user_email, success_url, cancel_url } = body

    if (!price_id || !user_id || !success_url || !cancel_url) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (ALLOWED_PRICE_IDS.size > 0 && !ALLOWED_PRICE_IDS.has(price_id)) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 })
    }

    const stripeKey = process.env.STRIPE_API_KEY
    if (!stripeKey) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 })
    }

    const params = new URLSearchParams({
      mode: "subscription",
      "line_items[0][price]": price_id,
      "line_items[0][quantity]": "1",
      success_url,
      cancel_url,
      "metadata[user_id]": user_id,
    })
    if (user_email) params.set("customer_email", user_email)

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    })

    const session = await res.json()

    if (!res.ok) {
      console.error("Stripe error:", session)
      return NextResponse.json({ error: session?.error?.message ?? "Stripe error" }, { status: 500 })
    }

    return NextResponse.json({ checkout_url: session.url })
  } catch (err) {
    console.error("Stripe checkout error:", err)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
