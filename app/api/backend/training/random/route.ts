import { NextResponse } from "next/server"
export async function GET() {
  try {
    const r = await fetch("http://localhost:8000/training/random")
    return NextResponse.json(await r.json())
  } catch { return NextResponse.json({ error: "Backend inaccessible" }, { status: 500 }) }
}
