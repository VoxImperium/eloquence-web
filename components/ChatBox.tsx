"use client"
import { useState, useRef, useEffect } from "react"
import type { Message, Source } from "@/types/chat"
import { sendChatMessage } from "@/lib/chat-api"
import ChatMessage from "@/components/ChatMessage"
import ChatInput from "@/components/ChatInput"
import { AlertTriangle, RefreshCw, Trash2 } from "lucide-react"

interface MessageWithSources extends Message {
  id: string
  sources?: Source[]
}

let msgCounter = 0
function nextId() { return `msg-${++msgCounter}` }

const WELCOME: MessageWithSources = {
  id: nextId(),
  role: "assistant",
  content: "Bonjour ! Je suis **Thémis**, votre assistant juridique. Posez-moi vos questions en droit civil, pénal, social, commercial ou administratif. Je consulte la jurisprudence et les textes de loi via OpenLégi pour vous apporter des réponses précises et sourcées.",
  timestamp: new Date(),
}

export default function ChatBox() {
  const [messages,  setMessages]  = useState<MessageWithSources[]>([WELCOME])
  const [input,     setInput]     = useState("")
  const [domaine,   setDomaine]   = useState("civil")
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: MessageWithSources = {
      id: nextId(),
      role: "user",
      content: text,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput("")
    setLoading(true)
    setError(null)

    try {
      // Build the messages array without sources for the API
      const apiMessages = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }))
      const data = await sendChatMessage(apiMessages, domaine)
      const assistantMsg: MessageWithSources = {
        id: nextId(),
        role: "assistant",
        content: data.response || '',
        sources: data.sources,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    // Retry with the last user message
    const lastUserIdx = [...messages].map(m => m.role).lastIndexOf("user")
    if (lastUserIdx === -1) return
    const lastUser = messages[lastUserIdx]
    setInput(lastUser.content)
    setError(null)
    setMessages(prev => prev.slice(0, lastUserIdx))
  }

  const handleClear = () => {
    setMessages([WELCOME])
    setError(null)
    setInput("")
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "calc(100vh - 64px)",
      maxWidth: 900,
      margin: "0 auto",
      width: "100%",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 24px",
        borderBottom: "1px solid rgba(201,168,76,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22 }}>⚖️</span>
          <div>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(18px, 2vw, 24px)",
              fontWeight: 300,
              color: "#f5f0e8",
              lineHeight: 1.2,
            }}>
              Chatbox Juridique
            </h1>
            <p style={{
              fontFamily: "'Raleway', sans-serif",
              fontSize: 11,
              color: "#8a8070",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}>
              Propulsé par OpenLégi
            </p>
          </div>
        </div>
        <button
          onClick={handleClear}
          aria-label="Effacer la conversation"
          title="Effacer la conversation"
          style={{
            padding: "6px 10px",
            background: "transparent",
            border: "1px solid rgba(201,168,76,0.15)",
            borderRadius: 8,
            color: "#6a6258",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            fontFamily: "'Raleway', sans-serif",
            letterSpacing: "0.08em",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = "#c9a84c"
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,168,76,0.35)"
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = "#6a6258"
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,168,76,0.15)"
          }}
        >
          <Trash2 size={13} />
          Effacer
        </button>
      </div>

      {/* Messages area */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
      }}>
        {messages.map(msg => (
          <ChatMessage
            key={msg.id}
            message={msg}
            sources={msg.sources}
          />
        ))}

        {/* Loading indicator */}
        {loading && (
          <div style={{
            display: "flex",
            justifyContent: "flex-start",
            marginBottom: 16,
            animation: "fadeInMsg 0.25s ease",
          }}>
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
            <div style={{
              padding: "12px 16px",
              borderRadius: "16px 16px 16px 4px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(201,168,76,0.12)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              <span style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#c9a84c",
                animation: "dotPulse 1.4s infinite ease-in-out",
              }} />
              <span style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#c9a84c",
                animation: "dotPulse 1.4s infinite ease-in-out 0.2s",
              }} />
              <span style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#c9a84c",
                animation: "dotPulse 1.4s infinite ease-in-out 0.4s",
              }} />
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            padding: "12px 16px",
            borderRadius: 10,
            background: "rgba(220,38,38,0.08)",
            border: "1px solid rgba(220,38,38,0.25)",
            marginBottom: 16,
            animation: "fadeInMsg 0.25s ease",
          }}>
            <AlertTriangle size={16} style={{ color: "#f87171", flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <p style={{
                color: "#fca5a5",
                fontFamily: "'Raleway', sans-serif",
                fontSize: 13,
                lineHeight: 1.5,
              }}>
                {error}
              </p>
            </div>
            <button
              onClick={handleRetry}
              aria-label="Réessayer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 10px",
                background: "rgba(220,38,38,0.1)",
                border: "1px solid rgba(220,38,38,0.3)",
                borderRadius: 6,
                color: "#fca5a5",
                fontFamily: "'Raleway', sans-serif",
                fontSize: 11,
                cursor: "pointer",
                flexShrink: 0,
                transition: "all 0.2s",
              }}
            >
              <RefreshCw size={11} />
              Réessayer
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={handleSend}
        domaine={domaine}
        onDomaineChange={setDomaine}
        loading={loading}
      />

      <style>{`
        @keyframes fadeInMsg {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40%           { opacity: 1;   transform: scale(1.1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
