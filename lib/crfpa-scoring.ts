/**
 * CRFPA Grand Oral scoring logic.
 *
 * Official evaluation grid (total /20):
 *   1. Maîtrise du sujet         — 4 pts
 *   2. Argumentation juridique   — 4 pts
 *   3. Structure & organisation  — 3 pts
 *   4. Prestance & expression    — 5 pts
 *   5. Esprit critique & actualité — 4 pts
 *
 * Sources: CNB / IEJ exam guidelines, jury feedback reports.
 */

import type { QaExchange, ScoreBreakdown } from "@/types/crfpa"

export const SCORE_MAX: ScoreBreakdown = {
  maitrise_sujet:   4,
  argumentation:    4,
  structure:        3,
  prestance_orale:  5,
  esprit_critique:  4,
}

export const TOTAL_MAX = 20

/**
 * Build the initial score breakdown based on the AI's analysis of the exposé.
 * Scores are mid-range by default; they will be adjusted during Q&A.
 */
export function buildInitialScoreBreakdown(): ScoreBreakdown {
  return {
    maitrise_sujet:  2.0,
    argumentation:   2.0,
    structure:       1.5,
    prestance_orale: 2.5,
    esprit_critique: 2.0,
  }
}

/**
 * Apply a per-exchange score delta to the running breakdown.
 * Deltas come from the AI jury evaluation of each Q&A answer.
 *
 * Rules (from grille officielle):
 *   +0.5  — correct legal reference with verified source
 *   -0.5  — legal error (corrected by jury)
 *   -0.25 — off-topic question posed to the jury
 *   +0.25 — strong composure / aisance
 */
export type DeltaReason =
  | "correct_legal_reference"
  | "legal_error"
  | "off_topic_question"
  | "good_composure"

export const DELTA_VALUES: Record<DeltaReason, number> = {
  correct_legal_reference:  0.5,
  legal_error:             -0.5,
  off_topic_question:      -0.25,
  good_composure:           0.25,
}

/**
 * Apply a list of delta reasons to a score breakdown.
 * Scores are clamped to [0, max] per criterion.
 */
export function applyDeltas(
  breakdown: ScoreBreakdown,
  reasons: DeltaReason[],
): ScoreBreakdown {
  const updated = { ...breakdown }
  for (const reason of reasons) {
    const delta = DELTA_VALUES[reason]
    switch (reason) {
      case "correct_legal_reference":
        updated.argumentation    = clamp(updated.argumentation    + delta, 0, SCORE_MAX.argumentation)
        break
      case "legal_error":
        updated.maitrise_sujet   = clamp(updated.maitrise_sujet   + delta, 0, SCORE_MAX.maitrise_sujet)
        updated.argumentation    = clamp(updated.argumentation    + delta, 0, SCORE_MAX.argumentation)
        break
      case "off_topic_question":
        updated.esprit_critique  = clamp(updated.esprit_critique  + delta, 0, SCORE_MAX.esprit_critique)
        break
      case "good_composure":
        updated.prestance_orale  = clamp(updated.prestance_orale  + delta, 0, SCORE_MAX.prestance_orale)
        break
    }
  }
  return updated
}

/** Compute final /20 score from breakdown. */
export function computeFinalScore(breakdown: ScoreBreakdown): number {
  const raw =
    breakdown.maitrise_sujet +
    breakdown.argumentation +
    breakdown.structure +
    breakdown.prestance_orale +
    breakdown.esprit_critique
  return Math.min(Math.max(Math.round(raw * 2) / 2, 0), TOTAL_MAX)
}

/**
 * Derive a score breakdown from the AI's holistic analysis of the full exposé text.
 * Factors penalised or rewarded are listed below based on the official CNB/IEJ criteria.
 */
export function analyseExposeForScoring(exposeText: string): Partial<ScoreBreakdown> {
  const text = exposeText.toLowerCase()
  const result: ScoreBreakdown = buildInitialScoreBreakdown()

  // Structure signals
  const hasIntroduction = /\b(tout d'abord|en premier lieu|dans un premier temps|je vais vous présenter)\b/.test(text)
  const hasConclusion   = /\b(en conclusion|pour conclure|ainsi|finalement|en définitive)\b/.test(text)
  const hasPlan         = /\b(premièrement|deuxièmement|d'une part|d'autre part|i\.|ii\.)\b/.test(text)

  if (hasIntroduction) result.structure = clamp(result.structure + 0.5, 0, SCORE_MAX.structure)
  if (hasConclusion)   result.structure = clamp(result.structure + 0.5, 0, SCORE_MAX.structure)
  if (hasPlan)         result.structure = clamp(result.structure + 0.5, 0, SCORE_MAX.structure)

  // Legal knowledge signals
  const hasJurisprudence = /\b(cour de cassation|conseil d'état|cedh|cjue|arrêt|décision n°)\b/.test(text)
  const hasCodeRef       = /\b(article|art\.|alinéa|l\.\d|r\.\d|code civil|code pénal|csp)\b/.test(text)

  if (hasJurisprudence) result.argumentation = clamp(result.argumentation + 0.5, 0, SCORE_MAX.argumentation)
  if (hasCodeRef)       result.maitrise_sujet = clamp(result.maitrise_sujet + 0.5, 0, SCORE_MAX.maitrise_sujet)

  return result
}

/** Compute an array of readable feedback points from the score breakdown. */
export function buildFeedbackPoints(breakdown: ScoreBreakdown): {
  points_forts: string[]
  points_faibles: string[]
} {
  const points_forts: string[] = []
  const points_faibles: string[] = []

  const thresholds: Array<{ key: keyof ScoreBreakdown; label: string; max: number }> = [
    { key: "maitrise_sujet",   label: "Maîtrise du sujet",               max: SCORE_MAX.maitrise_sujet   },
    { key: "argumentation",    label: "Argumentation juridique",         max: SCORE_MAX.argumentation    },
    { key: "structure",        label: "Structure & organisation",        max: SCORE_MAX.structure        },
    { key: "prestance_orale",  label: "Prestance & expression orale",    max: SCORE_MAX.prestance_orale  },
    { key: "esprit_critique",  label: "Esprit critique & actualité",     max: SCORE_MAX.esprit_critique  },
  ]

  for (const { key, label, max } of thresholds) {
    const score = breakdown[key]
    const ratio = score / max
    if (ratio >= 0.75) {
      points_forts.push(`${label} (${score}/${max})`)
    } else if (ratio < 0.5) {
      points_faibles.push(`${label} (${score}/${max}) — à renforcer`)
    }
  }

  return { points_forts, points_faibles }
}

/** Derive per-answer score deltas from the AI jury's evaluation of a Q&A exchange. */
export function parseExchangeDeltas(exchange: QaExchange): DeltaReason[] {
  const reasons: DeltaReason[] = []
  const text = (exchange.answer_text ?? exchange.answer_retranscription ?? "").toLowerCase()

  // Heuristic: answered with a verified legal reference
  if (/\b(article|arrêt|décision|cour de cassation|conseil d'état|cedh|cjue)\b/.test(text)) {
    reasons.push("correct_legal_reference")
  }

  return reasons
}

// ────────────────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
