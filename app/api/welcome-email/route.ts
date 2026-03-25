import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const res = await fetch(
      "https://eloquence-api-production.up.railway.app/emails/welcome",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    )
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch {
    // Railway unreachable — silently return ok so frontend doesn't see errors
    return NextResponse.json({ ok: true, skipped: true }, { status: 200 })
  }
}
