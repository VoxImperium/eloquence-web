import { NextRequest, NextResponse } from "next/server"
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const r = await fetch("http://localhost:8000/speech/analyze-audio", {
      method: "POST", body: formData
    })
    return NextResponse.json(await r.json(), { status: r.status })
  } catch { return NextResponse.json({ error: "Backend inaccessible" }, { status: 500 }) }
}
