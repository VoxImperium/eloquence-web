import { NextRequest, NextResponse } from "next/server"
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const r = await fetch("https://eloquence-api-production.up.railway.app/training/message", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
    })
    return NextResponse.json(await r.json(), { status: r.status })
  } catch { return NextResponse.json({ error: "Backend inaccessible" }, { status: 500 }) }
}
