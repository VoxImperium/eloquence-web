import type { Message, ChatResponse } from "@/types/chat"

export async function sendChatMessage(
  messages: Message[],
  domaine: string
): Promise<ChatResponse> {
  const res = await fetch("/api/backend/legifrance/chat/juridique", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, domaine }),
  })

  if (!res.ok) {
    let detail = "Impossible de contacter le service. Vérifiez votre connexion."
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
