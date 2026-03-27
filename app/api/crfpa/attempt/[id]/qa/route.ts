/**
 * POST /api/crfpa/attempt/[id]/qa
 *
 * Unified Q&A endpoint. Accepts a { phase } discriminator:
 *   phase = "question" — AI jury generates the next question
 *   phase = "answer"   — candidate submits their answer; AI may generate next question
 */
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { QaAnswerBody, QaTranscript, ScoreBreakdown, CrfpaSubject } from "@/types/crfpa"
import {
  generateFirstQuestion,
  generateFollowUpQuestion,
  isEndOfInterview,
} from "@/lib/crfpa-ai"
import {
  applyDeltas,
  buildInitialScoreBreakdown,
  computeFinalScore,
} from "@/lib/crfpa-scoring"
import { transcribeAudio } from "@/lib/groq-transcription"

const MAX_QA_EXCHANGES = 10 // ~30 minutes at ~3 min/exchange

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

  const typedBody = body as { phase?: string } & QaAnswerBody

  // ── Fetch the attempt ──────────────────────────────────────────────────────
  const { data: attempt, error: fetchError } = await supabase
    .from("crfpa_attempts")
    .select("id, user_id, subject_id, expose_text, expose_retranscription, qa_transcript, score_breakdown, status")
    .eq("id", attemptId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (fetchError || !attempt) {
    return NextResponse.json({ error: "Tentative introuvable" }, { status: 404 })
  }

  if (attempt.status === "finished") {
    return NextResponse.json({ error: "Cette simulation est déjà terminée" }, { status: 409 })
  }

  // ── Fetch the subject ──────────────────────────────────────────────────────
  const { data: subject, error: subjectError } = await supabase
    .from("crfpa_subjects")
    .select("*")
    .eq("id", attempt.subject_id)
    .maybeSingle()

  if (subjectError || !subject) {
    return NextResponse.json({ error: "Sujet introuvable" }, { status: 404 })
  }

  const transcript: QaTranscript = attempt.qa_transcript ?? { exchanges: [] }
  const exchanges = transcript.exchanges ?? []
  const exposeText = attempt.expose_text ?? attempt.expose_retranscription ?? ""
  const breakdown: ScoreBreakdown = attempt.score_breakdown ?? buildInitialScoreBreakdown()

  // ── Phase: generate a jury question ───────────────────────────────────────
  if (!typedBody.phase || typedBody.phase === "question") {
    if (exchanges.length >= MAX_QA_EXCHANGES) {
      return NextResponse.json({
        end_of_interview: true,
        message:          "Le temps d'entretien est écoulé. Veuillez finaliser la simulation.",
      })
    }

    let juryOutput
    try {
      if (exchanges.length === 0) {
        juryOutput = await generateFirstQuestion(subject as CrfpaSubject, exposeText)
      } else {
        const lastExchange = exchanges[exchanges.length - 1]
        const lastAnswer   = lastExchange.answer_text ?? lastExchange.answer_retranscription ?? ""
        juryOutput = await generateFollowUpQuestion(
          subject as CrfpaSubject,
          exposeText,
          exchanges,
          lastAnswer,
        )
      }
    } catch (err) {
      console.error("[CRFPA/qa] AI generation error:", err)
      return NextResponse.json({ error: "Erreur lors de la génération de la question" }, { status: 500 })
    }

    if (isEndOfInterview(juryOutput)) {
      return NextResponse.json({
        end_of_interview: true,
        final_comment:    juryOutput.final_comment,
      })
    }

    return NextResponse.json({
      question:            juryOutput.question,
      comment_on_previous: juryOutput.comment_on_previous,
      legal_correction:    juryOutput.legal_correction,
      off_topic_reproach:  juryOutput.off_topic_reproach,
    })
  }

  // ── Phase: save candidate answer ──────────────────────────────────────────
  if (typedBody.phase === "answer") {
    const { question, answer_text, answer_audio_url } = typedBody

    if (!question) {
      return NextResponse.json({ error: "question manquante" }, { status: 400 })
    }
    if (!answer_text && !answer_audio_url) {
      return NextResponse.json({ error: "answer_text ou answer_audio_url requis" }, { status: 400 })
    }

    // Transcribe audio answer if provided
    let answerRetranscription: string | null = null
    if (answer_audio_url) {
      try {
        answerRetranscription = await transcribeAudio(answer_audio_url)
      } catch (err) {
        console.error("[CRFPA/qa/answer] Transcription error:", err)
      }
    }

    // Build new exchange (score deltas will be applied when next question is generated)
    const newExchange = {
      question,
      answer_text:             answer_text ?? null,
      answer_audio_url:        answer_audio_url ?? null,
      answer_retranscription:  answerRetranscription,
      timestamp:               new Date().toISOString(),
      score_delta:             0,
    }

    const updatedExchanges = [...exchanges, newExchange]
    const updatedTranscript: QaTranscript = { exchanges: updatedExchanges }

    // Check if this is the last allowed exchange
    const isLastExchange = updatedExchanges.length >= MAX_QA_EXCHANGES

    // Get next question (or end) from AI
    let nextJuryOutput
    try {
      const answerForAI = answer_text ?? answerRetranscription ?? ""
      nextJuryOutput = await generateFollowUpQuestion(
        subject as CrfpaSubject,
        exposeText,
        updatedExchanges,
        answerForAI,
      )
    } catch (err) {
      console.error("[CRFPA/qa/answer] Follow-up question error:", err)
      // Save the answer even if AI fails
      await supabase
        .from("crfpa_attempts")
        .update({
          qa_transcript: updatedTranscript,
          status:        isLastExchange ? "qa" : "qa",
          updated_at:    new Date().toISOString(),
        })
        .eq("id", attemptId)
        .eq("user_id", user.id)

      return NextResponse.json({
        retranscription: answerRetranscription,
        next_question:   null,
        error_note:      "Réponse sauvegardée mais génération de question échouée",
      })
    }

    // Apply score deltas from the AI's evaluation
    let updatedBreakdown = { ...breakdown }
    if (!isEndOfInterview(nextJuryOutput) && nextJuryOutput.score_deltas?.length) {
      const validDeltas = nextJuryOutput.score_deltas.filter(
        (d): d is Parameters<typeof applyDeltas>[1][number] =>
          ["correct_legal_reference", "legal_error", "off_topic_question", "good_composure"].includes(d)
      )
      if (validDeltas.length > 0) {
        updatedBreakdown = applyDeltas(updatedBreakdown, validDeltas)
      }
    }

    const endOfInterview = isEndOfInterview(nextJuryOutput) || isLastExchange

    // Save updated transcript and score breakdown
    const { error: updateError } = await supabase
      .from("crfpa_attempts")
      .update({
        qa_transcript:   updatedTranscript,
        score_breakdown: updatedBreakdown,
        status:          endOfInterview ? "qa" : "qa",
        updated_at:      new Date().toISOString(),
      })
      .eq("id", attemptId)
      .eq("user_id", user.id)

    if (updateError) {
      console.error("[CRFPA/qa/answer] Update error:", updateError)
      return NextResponse.json({ error: "Erreur lors de la sauvegarde" }, { status: 500 })
    }

    if (endOfInterview) {
      const finalScore = computeFinalScore(updatedBreakdown)
      return NextResponse.json({
        retranscription:  answerRetranscription,
        end_of_interview: true,
        final_comment:    isEndOfInterview(nextJuryOutput) ? nextJuryOutput.final_comment : null,
        final_score:      finalScore,
      })
    }

    return NextResponse.json({
      retranscription: answerRetranscription,
      next_question: {
        question:            nextJuryOutput.question,
        comment_on_previous: nextJuryOutput.comment_on_previous,
        legal_correction:    nextJuryOutput.legal_correction,
        off_topic_reproach:  nextJuryOutput.off_topic_reproach,
      },
    })
  }

  return NextResponse.json({ error: "phase invalide (question|answer)" }, { status: 400 })
}
