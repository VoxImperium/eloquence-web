/**
 * CRFPA Grand Oral — AI jury behaviour.
 *
 * Security rules:
 *   1. Never invent legal information — cite verified sources only.
 *   2. If a legal claim cannot be verified, say so explicitly.
 *   3. Correct candidate errors but always with a source.
 *   4. Off-topic questions from the candidate: reproach + answer + -0.25 pt penalty.
 *   5. Never refuse to answer — always engage, even while noting an issue.
 *
 * The AI communicates through the Groq API (using a chat completion model).
 */

import type { QaExchange, CrfpaSubject } from "@/types/crfpa"

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
const GROQ_MODEL   = "llama3-70b-8192"

/** System prompt for the AI jury. */
function buildJurySystemPrompt(subject: CrfpaSubject): string {
  return `Tu es un jury du Grand Oral du CRFPA (Centre Régional de Formation Professionnelle des Avocats).
Tu es composé de trois membres : un avocat senior, un magistrat et un enseignant-chercheur en droit.

SUJET DU CANDIDAT : "${subject.title}"
CATÉGORIE : ${subject.category ?? "droits et libertés fondamentaux"}
${subject.year ? `ANNÉE ANNALE : ${subject.year}` : ""}

## RÔLE ET COMPORTEMENT

Tu joues le rôle du jury qui conduit l'entretien après l'exposé du candidat (30 minutes au total).
Ton objectif est d'évaluer :
1. La maîtrise du sujet (compréhension, problématisation, enjeux)
2. L'argumentation et le raisonnement juridique (références, logique)
3. La structure et l'organisation de la pensée
4. L'aisance orale et la gestion du stress
5. L'esprit critique et la connaissance de l'actualité juridique

## RÈGLES STRICTES

### Information juridique
- **JAMAIS inventer** une jurisprudence, un article de loi, une doctrine ou un fait juridique.
- **TOUJOURS citer tes sources** : nom de la Cour, date, numéro d'arrêt, référence légale.
- Si tu n'es pas certain d'une information juridique, dis-le explicitement : "Je dois vérifier cette affirmation" ou "À ma connaissance, mais cela mériterait vérification."
- **Corriger les erreurs** du candidat UNIQUEMENT avec une source vérifiée. Format : "Attention, l'article X du Code Y précise au contraire que..."

### Gestion des questions hors-sujet du candidat
- Si le candidat pose une question hors du sujet tiré : **fais le reproche** ("Poser une question à votre jury sort du cadre de l'exercice."), PUIS réponds quand même.
- Note interne : cette situation entraîne une pénalité de -0.25 point.

### Format de réponse
- Pose UNE SEULE question à la fois, courte et précise.
- Commence par éventuellement commenter la réponse précédente du candidat (en 1-2 phrases), puis pose la question suivante.
- Vocabulaire : soutenu, professionnel, celui d'un jury d'examen.
- Longueur : 80-150 mots maximum par intervention.
- Ne jamais terminer par plusieurs questions d'affilée.

Tu réponds UNIQUEMENT en JSON avec la structure :
{
  "question": "Ta question au candidat",
  "comment_on_previous": "Commentaire bref sur la réponse précédente (peut être vide)",
  "legal_correction": null | { "error": "ce que le candidat a dit de faux", "correction": "la bonne information", "source": "référence légale vérifiée" },
  "off_topic_reproach": null | "Le reproche si le candidat a posé une question hors-sujet",
  "score_deltas": ["correct_legal_reference" | "legal_error" | "off_topic_question" | "good_composure"]
}`
}

/** Build the question prompt for the first jury question after the exposé. */
function buildFirstQuestionPrompt(exposeText: string): string {
  return `Le candidat vient de terminer son exposé de 15 minutes. Voici la retranscription :

---
${exposeText.slice(0, 3000)}
---

Pose ta première question d'entretien. Elle doit approfondir un point de l'exposé ou challenger une affirmation. Sois précis et exigeant.`
}

/** Build the follow-up question prompt based on previous exchanges. */
function buildFollowUpPrompt(
  exposeText: string,
  exchanges: QaExchange[],
  latestAnswer: string,
): string {
  const history = exchanges
    .map((e, i) => `Q${i + 1}: ${e.question}\nR${i + 1}: ${e.answer_text ?? e.answer_retranscription ?? "(pas de réponse)"}`)
    .join("\n\n")

  return `Exposé du candidat (résumé) :
${exposeText.slice(0, 1000)}

---
Échanges précédents :
${history}

---
Dernière réponse du candidat :
"${latestAnswer}"

Pose ta prochaine question ou, si c'est la dernière (après 8 échanges ou 30 min simulées), dis UNIQUEMENT : {"end_of_interview": true, "final_comment": "..."}`
}

interface JuryResponse {
  question: string
  comment_on_previous: string
  legal_correction: {
    error: string
    correction: string
    source: string
  } | null
  off_topic_reproach: string | null
  score_deltas: string[]
}

interface EndOfInterviewResponse {
  end_of_interview: true
  final_comment: string
}

export type AiJuryOutput = JuryResponse | EndOfInterviewResponse

/**
 * Call the Groq API and return the parsed jury response.
 */
async function callGroq(
  systemPrompt: string,
  userMessage: string,
): Promise<AiJuryOutput> {
  const groqKey = process.env.GROQ_API_KEY
  if (!groqKey) {
    throw new Error("GROQ_API_KEY is not configured")
  }

  const body = {
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userMessage },
    ],
    temperature: 0.4,
    max_tokens:  600,
    response_format: { type: "json_object" },
  }

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${groqKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Groq API error ${res.status}: ${errText}`)
  }

  const data = await res.json() as {
    choices: Array<{ message: { content: string } }>
  }

  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error("Empty response from Groq")

  try {
    return JSON.parse(content) as AiJuryOutput
  } catch {
    throw new Error(`Failed to parse Groq JSON response: ${content}`)
  }
}

/**
 * Generate the first jury question after the exposé.
 */
export async function generateFirstQuestion(
  subject: CrfpaSubject,
  exposeText: string,
): Promise<AiJuryOutput> {
  const system = buildJurySystemPrompt(subject)
  const user   = buildFirstQuestionPrompt(exposeText)
  return callGroq(system, user)
}

/**
 * Generate a follow-up jury question based on the previous exchanges.
 */
export async function generateFollowUpQuestion(
  subject: CrfpaSubject,
  exposeText: string,
  exchanges: QaExchange[],
  latestAnswer: string,
): Promise<AiJuryOutput> {
  const system = buildJurySystemPrompt(subject)
  const user   = buildFollowUpPrompt(exposeText, exchanges, latestAnswer)
  return callGroq(system, user)
}

/**
 * Generate the final bilan/feedback from the jury at the end of the simulation.
 */
export async function generateFinalFeedback(
  subject: CrfpaSubject,
  exposeText: string,
  exchanges: QaExchange[],
  finalScore: number,
): Promise<{ feedback: string; references_a_revoir: Array<{ type: string; reference: string; description: string }> }> {
  const groqKey = process.env.GROQ_API_KEY
  if (!groqKey) {
    throw new Error("GROQ_API_KEY is not configured")
  }

  const history = exchanges
    .map((e, i) => `Q${i + 1}: ${e.question}\nR${i + 1}: ${e.answer_text ?? e.answer_retranscription ?? "(pas de réponse)"}`)
    .join("\n\n")

  const systemPrompt = buildJurySystemPrompt(subject)
  const userMessage  = `La simulation est terminée. Score final attribué : ${finalScore}/20.

Exposé du candidat :
${exposeText.slice(0, 1500)}

Échanges d'entretien :
${history}

Génère un bilan détaillé en JSON :
{
  "feedback": "Commentaire global du jury (200-400 mots), précis, professionnel, constructif. Mentionner des éléments spécifiques de l'exposé et des échanges.",
  "references_a_revoir": [
    {
      "type": "jurisprudence|code|doctrine|traité",
      "reference": "Référence exacte VÉRIFIÉE (ex: Cass. soc., 25 juin 2014, n°13-28.369 ou Art. L.1110-4 CSP)",
      "description": "Pourquoi cette référence est pertinente pour ce sujet"
    }
  ]
}

RÈGLE ABSOLUE : Ne cite que des références juridiques que tu peux garantir avec certitude. Si une référence est incertaine, ne la cite pas. Qualité > quantité.`

  const body = {
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userMessage },
    ],
    temperature: 0.3,
    max_tokens:  1200,
    response_format: { type: "json_object" },
  }

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${groqKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Groq API error ${res.status}: ${errText}`)
  }

  const data = await res.json() as {
    choices: Array<{ message: { content: string } }>
  }

  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error("Empty Groq response for final feedback")

  try {
    const parsed = JSON.parse(content) as {
      feedback: string
      references_a_revoir?: Array<{ type: string; reference: string; description: string }>
      references?: Array<{ type: string; reference: string; description: string }>
    }
    return {
      feedback:            parsed.feedback,
      references_a_revoir: parsed.references_a_revoir ?? parsed.references ?? [],
    }
  } catch {
    throw new Error(`Failed to parse final feedback JSON: ${content}`)
  }
}

/** Check whether the jury response signals end of interview. */
export function isEndOfInterview(output: AiJuryOutput): output is EndOfInterviewResponse {
  return "end_of_interview" in output && (output as EndOfInterviewResponse).end_of_interview === true
}
