import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { PrepBody } from "@/types/crfpa"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const attemptId = parseInt(id, 10)
  if (isNaN(attemptId)) {
    return NextResponse.json({ error: "ID de tentative invalide" }, { status: 400 })
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(list) { list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) },
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 })
  }

  const { prep_notes, duration_seconds } = body as PrepBody
  if (typeof prep_notes !== "string") {
    return NextResponse.json({ error: "prep_notes manquant" }, { status: 400 })
  }

  const { error: updateError } = await supabase
    .from("crfpa_attempts")
    .update({
      prep_notes,
      ...(duration_seconds !== undefined && { prep_duration_seconds: duration_seconds }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", attemptId)
    .eq("user_id", user.id) // RLS: only owner can update

  if (updateError) {
    console.error("[CRFPA/attempt/prep] Update error:", updateError)
    return NextResponse.json({ error: "Erreur lors de la sauvegarde" }, { status: 500 })
  }

  return NextResponse.json({ saved: true })
}
