export interface Message {
  role: "user" | "assistant"
  content: string
  timestamp?: Date
}

export interface Source {
  type: "jurisprudence" | "loi" | "texte"
  titre: string
  contenu: string
  url?: string
  date?: string
}

export interface ChatResponse {
  response: string
  sources: Source[]
}
