import type { Message, ChatResponse } from "@/types/chat"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function sendChatMessage(
  messages: Message[],
  domaine: string
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat/juridique`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, domaine }),
  })

  if (!res.ok) {
    let detail = res.status === 404
      ? "Endpoint introuvable. Vérifiez la configuration de l'API."
      : "Impossible de contacter le service. Vérifiez votre connexion."
    try {
      const err = await res.json()
      if (err?.detail) detail = err.detail
    } catch {
      // ignore parse error
    }
    throw new Error(detail)
  }

  return res.json()
}
