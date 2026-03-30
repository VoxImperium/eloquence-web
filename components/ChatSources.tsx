import type { Source } from "@/types/chat"

interface ChatSourcesProps {
  sources: Source[]
}

export default function ChatSources({ sources }: ChatSourcesProps) {
  if (!sources || sources.length === 0) return null

  return (
    <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
      {sources.map((src, i) => (
        <a
          key={`${src.titre}-${src.url ?? i}`}
          href={src.url || undefined}
          target={src.url ? "_blank" : undefined}
          rel={src.url ? "noopener noreferrer" : undefined}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            padding: "8px 12px",
            background: "rgba(201,168,76,0.06)",
            border: "1px solid rgba(201,168,76,0.18)",
            borderRadius: 6,
            maxWidth: 240,
            textDecoration: "none",
            cursor: src.url ? "pointer" : "default",
            transition: "background 0.2s, border-color 0.2s",
          }}
          onMouseEnter={e => {
            if (src.url) {
              (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.12)"
              ;(e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.35)"
            }
          }}
          onMouseLeave={e => {
            if (src.url) {
              (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.06)"
              ;(e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.18)"
            }
          }}
          aria-label={`Source : ${src.titre}`}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13 }}>
              {src.type === "jurisprudence" ? "🏛️" : "📜"}
            </span>
            <span style={{
              fontSize: 10,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#c9a84c",
              fontFamily: "'Raleway', sans-serif",
              fontWeight: 500,
            }}>
              {src.type === "jurisprudence" ? "Jurisprudence" : "Loi"}
            </span>
            {src.date && (
              <span style={{ fontSize: 9, color: "#6a6258", marginLeft: "auto" }}>
                {src.date}
              </span>
            )}
          </div>
          <span style={{
            fontSize: 11,
            color: "#f5f0e8",
            fontFamily: "'Raleway', sans-serif",
            fontWeight: 400,
            lineHeight: 1.4,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}>
            {src.titre}
          </span>
          {src.contenu && (
            <span style={{
              fontSize: 10,
              color: "#8a8070",
              fontFamily: "'Raleway', sans-serif",
              lineHeight: 1.4,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}>
              {src.contenu.slice(0, 80)}{src.contenu.length > 80 ? "…" : ""}
            </span>
          )}
        </a>
      ))}
    </div>
  )
}
