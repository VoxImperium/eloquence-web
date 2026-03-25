import { NextResponse } from "next/server"

export async function GET() {
  try {
    const response = await fetch("https://eloquence-api-production.up.railway.app/simulate/scenarios")
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Backend inaccessible" }, { status: 500 })
  }
}
