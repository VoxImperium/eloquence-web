import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { CrfpaSubject, QaTranscript, ScoreBreakdown } from "@/types/crfpa"
import {
  buildInitialScoreBreakdown,
  computeFinalScore,
  buildFeedbackPoints,
} from "@/lib/crfpa-scoring"
import { generateFinalFeedback } from "@/lib/crfpa-ai"

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

  // Fetch the attempt with all fields needed for final scoring
  const { data: attempt, error: fetchError } = await supabase
    .from("crfpa_attempts")
    .select("id, user_id, subject_id, expose_text, expose_retranscription, qa_transcript, score_breakdown, status, created_at")
    .eq("id", attemptId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (fetchError || !attempt) {
    return NextResponse.json({ error: "Tentative introuvable" }, { status: 404 })
  }

  if (attempt.status === "finished") {
    return NextResponse.json({ error: "Cette simulation est déjà finalisée" }, { status: 409 })
  }

  // Fetch the subject
  const { data: subject, error: subjectError } = await supabase
    .from("crfpa_subjects")
    .select("*")
    .eq("id", attempt.subject_id)
    .maybeSingle()

  if (subjectError || !subject) {
    return NextResponse.json({ error: "Sujet introuvable" }, { status: 404 })
  }

  const transcript: QaTranscript = attempt.qa_transcript ?? { exchanges: [] }
  const breakdown: ScoreBreakdown = attempt.score_breakdown ?? buildInitialScoreBreakdown()
  const exposeText = attempt.expose_text ?? attempt.expose_retranscription ?? ""

  // Compute final score
  const finalScore = computeFinalScore(breakdown)

  // Build structured feedback points from the breakdown
  const { points_forts, points_faibles } = buildFeedbackPoints(breakdown)

  // Generate AI feedback text and legal references
  let feedbackText   = ""
  let referencesARevoir: unknown[] = []

  try {
    const aiFeedback = await generateFinalFeedback(
      subject as CrfpaSubject,
      exposeText,
      transcript.exchanges,
      finalScore,
    )
    feedbackText       = aiFeedback.feedback
    referencesARevoir  = aiFeedback.references_a_revoir ?? []
  } catch (err) {
    console.error("[CRFPA/finish] AI feedback generation error:", err)
    feedbackText = `Score final : ${finalScore}/20. Merci pour votre participation à cette simulation du Grand Oral CRFPA.`
  }

  // Compute total duration
  const startDate     = new Date(attempt.created_at)
  const durationTotal = Math.round((Date.now() - startDate.getTime()) / 1000)

  // Save the final state
  const { error: updateError } = await supabase
    .from("crfpa_attempts")
    .update({
      final_score:           finalScore,
      score_breakdown:       breakdown,
      feedback_text:         feedbackText,
      points_forts,
      points_faibles,
      references_a_revoir:   referencesARevoir,
      duration_total_seconds: durationTotal,
      status:                "finished",
      updated_at:            new Date().toISOString(),
    })
    .eq("id", attemptId)
    .eq("user_id", user.id)

  if (updateError) {
    console.error("[CRFPA/finish] Update error:", updateError)
    return NextResponse.json({ error: "Erreur lors de la finalisation" }, { status: 500 })
  }

  return NextResponse.json({
    final_score:     finalScore,
    score_breakdown: breakdown,
    feedback:        feedbackText,
    points_forts,
    points_faibles,
    references:      referencesARevoir,
  })
}
