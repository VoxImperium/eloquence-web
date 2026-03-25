import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const response = await fetch("https://eloquence-api-production.up.railway.app/analyze/", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const text = await response.text()
      return NextResponse.json({ error: text }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 200 })

  } catch (error) {
    console.error("Erreur relay backend:", error)
    return NextResponse.json(
      { error: "Backend inaccessible — vérifie que le backend tourne sur le port 8000" },
      { status: 500 }
    )
  }
}
