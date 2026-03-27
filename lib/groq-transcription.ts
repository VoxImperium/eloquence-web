/**
 * Audio transcription via Groq Whisper API.
 * Shared utility used by expose and Q&A routes.
 */

const GROQ_WHISPER_URL = "https://api.groq.com/openai/v1/audio/transcriptions"

/**
 * Transcribe an audio file by URL using Groq's Whisper model.
 * The audio URL must be publicly accessible or pre-signed.
 *
 * @param audioUrl - URL of the audio file to transcribe
 * @returns The transcribed text
 */
export async function transcribeAudio(audioUrl: string): Promise<string> {
  const groqKey = process.env.GROQ_API_KEY
  if (!groqKey) throw new Error("GROQ_API_KEY non configuré")

  // Fetch the audio file from the provided URL
  const audioRes = await fetch(audioUrl)
  if (!audioRes.ok) {
    throw new Error(`Impossible de récupérer l'audio: ${audioRes.status}`)
  }

  const audioBlob = await audioRes.blob()
  const formData  = new FormData()
  formData.append("file", audioBlob, "audio.webm")
  formData.append("model", "whisper-large-v3")
  formData.append("language", "fr")
  formData.append("response_format", "text")

  const res = await fetch(GROQ_WHISPER_URL, {
    method:  "POST",
    headers: { Authorization: `Bearer ${groqKey}` },
    body:    formData,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq Whisper error ${res.status}: ${err}`)
  }

  return res.text()
}
