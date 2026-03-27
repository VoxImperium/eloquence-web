import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { ExposeBody } from "@/types/crfpa"
import {
  analyseExposeForScoring,
  buildInitialScoreBreakdown,
} from "@/lib/crfpa-scoring"
import { transcribeAudio } from "@/lib/groq-transcription"

export const maxDuration = 120

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

  const { expose_text, expose_audio_url, duration_seconds } = body as ExposeBody

  if (!expose_text && !expose_audio_url) {
    return NextResponse.json(
      { error: "expose_text ou expose_audio_url requis" },
      { status: 400 }
    )
  }

  // Transcribe audio if provided (via Groq Whisper)
  let retranscription: string | null = null
  if (expose_audio_url) {
    try {
      retranscription = await transcribeAudio(expose_audio_url)
    } catch (err) {
      console.error("[CRFPA/expose] Transcription error:", err)
      // Non-blocking: continue without transcription
    }
  }

  // The effective text for scoring
  const effectiveText = expose_text ?? retranscription ?? ""

  // Build initial score breakdown from exposé analysis
  const initialBreakdown = {
    ...buildInitialScoreBreakdown(),
    ...analyseExposeForScoring(effectiveText),
  }

  const { error: updateError } = await supabase
    .from("crfpa_attempts")
    .update({
      expose_text:                expose_text ?? null,
      expose_audio_url:           expose_audio_url ?? null,
      expose_retranscription:     retranscription,
      expose_duration_seconds:    duration_seconds ?? null,
      score_breakdown:            initialBreakdown,
      status:                     "expose",
      updated_at:                 new Date().toISOString(),
    })
    .eq("id", attemptId)
    .eq("user_id", user.id)

  if (updateError) {
    console.error("[CRFPA/expose] Update error:", updateError)
    return NextResponse.json({ error: "Erreur lors de la sauvegarde" }, { status: 500 })
  }

  return NextResponse.json({
    retranscription,
    initial_scoring_note:
      "Exposé reçu. L'entretien avec le jury commence maintenant.",
  })
}
