import type { Message, Source } from "@/types/chat"
import ChatSources from "@/components/ChatSources"

interface ChatMessageProps {
  message: Message
  sources?: Source[]
}

/** Render basic markdown: **bold**, *italic*, newlines → <br> */
function renderMarkdown(text: string) {
  const lines = text.split("\n")
  return lines.map((line, li) => {
    const parts: React.ReactNode[] = []
    let last = 0
    let match: RegExpExecArray | null
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g

    while ((match = regex.exec(line)) !== null) {
      if (match.index > last) parts.push(line.slice(last, match.index))
      if (match[2]) {
        parts.push(<strong key={match.index} style={{ fontWeight: 600 }}>{match[2]}</strong>)
      } else if (match[3]) {
        parts.push(<em key={match.index}>{match[3]}</em>)
      } else if (match[4]) {
        parts.push(
          <code key={match.index} style={{
            fontFamily: "monospace",
            background: "rgba(201,168,76,0.12)",
            padding: "1px 4px",
            borderRadius: 3,
            fontSize: "0.9em",
          }}>
            {match[4]}
          </code>
        )
      }
      last = match.index + match[0].length
    }
    if (last < line.length) parts.push(line.slice(last))
    return (
      <span key={li}>
        {parts}
        {li < lines.length - 1 && <br />}
      </span>
    )
  })
}

export default function ChatMessage({ message, sources }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 16,
      animation: "fadeInMsg 0.25s ease",
    }}>
      {!isUser && (
        <div style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "rgba(201,168,76,0.12)",
          border: "1px solid rgba(201,168,76,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginRight: 10,
          fontSize: 14,
        }}>
          ⚖️
        </div>
      )}

      <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start" }}>
        <div style={{
          padding: "12px 16px",
          borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          background: isUser
            ? "linear-gradient(135deg, #1e40af, #1d4ed8)"
            : "rgba(255,255,255,0.04)",
          border: isUser ? "none" : "1px solid rgba(201,168,76,0.12)",
          color: isUser ? "#fff" : "#f5f0e8",
          fontFamily: "'Raleway', sans-serif",
          fontSize: 14,
          lineHeight: 1.7,
          fontWeight: 300,
        }}>
          {isUser
            ? message.content
            : renderMarkdown(message.content)
          }
        </div>

        {!isUser && sources && sources.length > 0 && (
          <ChatSources sources={sources} />
        )}

        {message.timestamp && (
          <span style={{
            fontSize: 10,
            color: "#6a6258",
            marginTop: 4,
            fontFamily: "'Raleway', sans-serif",
          }}>
            {new Date(message.timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>

      {isUser && (
        <div style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "rgba(30,64,175,0.3)",
          border: "1px solid rgba(30,64,175,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginLeft: 10,
          fontSize: 14,
        }}>
          👤
        </div>
      )}
    </div>
  )
}
