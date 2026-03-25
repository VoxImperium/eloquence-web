import { NextResponse } from "next/server"
export async function GET() {
  try {
    const r = await fetch("https://eloquence-api-production.up.railway.app/training/topics")
    return NextResponse.json(await r.json())
  } catch { return NextResponse.json({ error: "Backend inaccessible" }, { status: 500 }) }
}
