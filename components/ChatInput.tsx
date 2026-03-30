import { useRef, useEffect, KeyboardEvent } from "react"
import { Send, Loader2 } from "lucide-react"

const DOMAINES = [
  { id: "civil",         label: "Droit civil"          },
  { id: "penal",         label: "Droit pénal"          },
  { id: "social",        label: "Droit du travail"     },
  { id: "commercial",    label: "Droit commercial"     },
  { id: "administratif", label: "Droit administratif"  },
  { id: "consommation",  label: "Droit de la conso"    },
]

interface ChatInputProps {
  value: string
  onChange: (val: string) => void
  onSubmit: () => void
  domaine: string
  onDomaineChange: (d: string) => void
  loading: boolean
}

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  domaine,
  onDomaineChange,
  loading,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = Math.min(el.scrollHeight, 160) + "px"
  }, [value])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (!loading && value.trim()) onSubmit()
    }
  }

  return (
    <div style={{
      padding: "16px 20px",
      borderTop: "1px solid rgba(201,168,76,0.1)",
      background: "rgba(10,10,15,0.97)",
      display: "flex",
      flexDirection: "column",
      gap: 10,
    }}>
      {/* Domain selector */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {DOMAINES.map(d => (
          <button
            key={d.id}
            onClick={() => onDomaineChange(d.id)}
            style={{
              padding: "4px 10px",
              borderRadius: 20,
              border: domaine === d.id
                ? "1px solid rgba(201,168,76,0.6)"
                : "1px solid rgba(201,168,76,0.15)",
              background: domaine === d.id
                ? "rgba(201,168,76,0.12)"
                : "transparent",
              color: domaine === d.id ? "#c9a84c" : "#6a6258",
              fontSize: 10,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
              fontFamily: "'Raleway', sans-serif",
              fontWeight: domaine === d.id ? 500 : 300,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            aria-pressed={domaine === d.id}
            aria-label={`Domaine juridique : ${d.label}`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Posez votre question juridique… (Entrée pour envoyer, Maj+Entrée pour nouvelle ligne)"
          disabled={loading}
          rows={1}
          aria-label="Question juridique"
          style={{
            flex: 1,
            resize: "none",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(201,168,76,0.2)",
            borderRadius: 10,
            padding: "10px 14px",
            color: "#f5f0e8",
            fontFamily: "'Raleway', sans-serif",
            fontSize: 14,
            fontWeight: 300,
            lineHeight: 1.6,
            outline: "none",
            minHeight: 44,
            maxHeight: 160,
            overflowY: "auto",
            transition: "border-color 0.2s",
          }}
          onFocus={e => (e.target.style.borderColor = "rgba(201,168,76,0.4)")}
          onBlur={e => (e.target.style.borderColor = "rgba(201,168,76,0.2)")}
        />
        <button
          onClick={onSubmit}
          disabled={loading || !value.trim()}
          aria-label="Envoyer la question"
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: loading || !value.trim()
              ? "rgba(201,168,76,0.1)"
              : "rgba(201,168,76,0.15)",
            border: "1px solid rgba(201,168,76,0.3)",
            color: loading || !value.trim() ? "#6a6258" : "#c9a84c",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: loading || !value.trim() ? "not-allowed" : "pointer",
            flexShrink: 0,
            transition: "all 0.2s",
          }}
          onMouseEnter={e => {
            if (!loading && value.trim()) {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(201,168,76,0.25)"
            }
          }}
          onMouseLeave={e => {
            if (!loading && value.trim()) {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(201,168,76,0.15)"
            }
          }}
        >
          {loading
            ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
            : <Send size={18} />
          }
        </button>
      </div>
    </div>
  )
}
