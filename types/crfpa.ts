// TypeScript interfaces for the CRFPA Grand Oral simulation

export interface CrfpaSubject {
  id: number
  title: string
  description: string | null
  difficulty: number // 1-5
  year: number | null
  source_url: string | null
  source_name: string | null // 'CNB', 'IEJ Strasbourg', 'IEJ Paris 1', etc.
  source_date: string | null
  category: string | null
  original_pdf_url: string | null
  created_at: string
  updated_at: string
}

// A single Q&A exchange between the AI jury and the candidate
export interface QaExchange {
  question: string
  answer_text: string | null
  answer_audio_url: string | null
  answer_retranscription: string | null
  timestamp: string
  score_delta: number // running adjustment (+/- small deltas applied per answer)
}

export interface QaTranscript {
  exchanges: QaExchange[]
}

// Score breakdown mapped to the official CRFPA Grand Oral evaluation grid
export interface ScoreBreakdown {
  maitrise_sujet: number    // /4
  argumentation: number     // /4
  structure: number         // /3
  prestance_orale: number   // /5
  esprit_critique: number   // /4
}

// A legal reference cited in feedback
export interface LegalReference {
  type: "jurisprudence" | "code" | "doctrine" | "traité"
  reference: string  // e.g. "Cass. soc., 25 juin 2014, n° 13-28.369" or "Art. L.1110-4 CSP"
  description: string
}

export interface CrfpaAttempt {
  id: number
  user_id: string
  subject_id: number

  // Prep phase
  prep_notes: string | null
  prep_duration_seconds: number | null

  // Exposé phase
  expose_text: string | null
  expose_audio_url: string | null
  expose_duration_seconds: number | null
  expose_retranscription: string | null

  // Q&A phase
  qa_transcript: QaTranscript

  // Scoring
  final_score: number | null  // 0-20
  score_breakdown: ScoreBreakdown | null

  // Feedback
  feedback_text: string | null
  points_forts: string[] | null
  points_faibles: string[] | null
  references_a_revoir: LegalReference[] | null

  // Status
  status: "prep" | "expose" | "qa" | "finished"

  // Timing
  duration_total_seconds: number | null
  created_at: string
  updated_at: string
}

// ── Request/Response shapes ──────────────────────────────────────────────────

export interface StartAttemptBody {
  subject_id: number
}

export interface PrepBody {
  prep_notes: string
  duration_seconds?: number
}

export interface ExposeBody {
  expose_text?: string
  expose_audio_url?: string
  duration_seconds?: number
}

export type QaQuestionBody = Record<string, never>

export interface QaAnswerBody {
  question: string
  answer_text?: string
  answer_audio_url?: string
}

export type FinishBody = Record<string, never>

// History item returned by GET /api/crfpa/user/history
export interface AttemptHistoryItem {
  id: number
  subject_title: string
  subject_category: string | null
  final_score: number | null
  status: string
  created_at: string
}
