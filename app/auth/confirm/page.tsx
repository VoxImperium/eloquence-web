"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

function ConfirmContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const [email, setEmail] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const token = searchParams.get("token")

    if (!token) {
      setStatus("error")
      setMessage("Lien de confirmation invalide. Aucun token trouvé.")
      return
    }

    fetch(`/api/auth/confirm?token=${encodeURIComponent(token)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatus("success")
          setEmail(data.email || "")
          setMessage("Votre email a été confirmé avec succès !")
          setTimeout(() => {
            router.push(
              `/login?confirmed=true${data.email ? `&email=${encodeURIComponent(data.email)}` : ""}`
            )
          }, 3000)
        } else {
          setStatus("error")
          setMessage(data.error || "Une erreur est survenue lors de la confirmation.")
        }
      })
      .catch(() => {
        setStatus("error")
        setMessage("Erreur serveur. Veuillez réessayer.")
      })
  }, [searchParams, router])

  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0a0a0f",
    }}>
      <div style={{
        maxWidth: 480,
        width: "100%",
        padding: "0 24px",
        textAlign: "center",
      }}>
        {/* Logo microphone */}
        <div style={{ marginBottom: 32 }}>
          <svg width="56" height="56" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", margin: "0 auto" }}>
            <rect x="14" y="2" width="8" height="16" rx="4" fill="#c9a84c"/>
            <path d="M6 18 Q6 26 18 26 Q30 26 30 18" stroke="#c9a84c" strokeWidth="2.4" fill="none" strokeLinecap="round"/>
            <line x1="18" y1="26" x2="18" y2="34" stroke="#c9a84c" strokeWidth="2.4" strokeLinecap="round"/>
            <line x1="10" y1="34" x2="26" y2="34" stroke="#c9a84c" strokeWidth="2.4" strokeLinecap="round"/>
          </svg>
        </div>

        <p style={{ marginBottom: 24, color: "#c9a84c", fontSize: 20 }}>✦</p>

        {status === "loading" && (
          <>
            <h1 style={{
              fontFamily: "Georgia, serif",
              fontSize: 36,
              fontWeight: 300,
              color: "#f5f0e8",
              marginBottom: 16,
              letterSpacing: "0.03em",
            }}>
              Confirmation en cours…
            </h1>
            <div style={{
              width: 48,
              height: 1,
              background: "linear-gradient(90deg, transparent, #c9a84c, transparent)",
              margin: "0 auto 24px",
            }} />
            <p style={{ fontSize: 14, color: "#8a8070", lineHeight: 1.7 }}>
              Veuillez patienter pendant que nous confirmons votre adresse email.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <h1 style={{
              fontFamily: "Georgia, serif",
              fontSize: 36,
              fontWeight: 300,
              color: "#f5f0e8",
              marginBottom: 16,
              letterSpacing: "0.03em",
            }}>
              Email confirmé ✦
            </h1>
            <div style={{
              width: 48,
              height: 1,
              background: "linear-gradient(90deg, transparent, #c9a84c, transparent)",
              margin: "0 auto 24px",
            }} />
            <p style={{
              fontFamily: "Georgia, serif",
              fontSize: 18,
              fontStyle: "italic",
              fontWeight: 300,
              color: "#c9a84c",
              marginBottom: 16,
              lineHeight: 1.6,
            }}>
              {message}
            </p>
            {email && (
              <p style={{ fontSize: 13, color: "#6a6258", marginBottom: 24 }}>
                {email}
              </p>
            )}
            <p style={{ fontSize: 14, color: "#8a8070", lineHeight: 1.7, marginBottom: 32 }}>
              Vous allez être redirigé vers la page de connexion dans quelques secondes.
            </p>
            <Link
              href={`/login?confirmed=true${email ? `&email=${encodeURIComponent(email)}` : ""}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 32px",
                background: "#c9a84c",
                color: "#0a0a0f",
                fontFamily: "Arial, sans-serif",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              Se connecter →
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h1 style={{
              fontFamily: "Georgia, serif",
              fontSize: 36,
              fontWeight: 300,
              color: "#f5f0e8",
              marginBottom: 16,
              letterSpacing: "0.03em",
            }}>
              Erreur de confirmation
            </h1>
            <div style={{
              width: 48,
              height: 1,
              background: "linear-gradient(90deg, transparent, #c9a84c, transparent)",
              margin: "0 auto 24px",
            }} />
            <p style={{ fontSize: 14, color: "#8a8070", lineHeight: 1.7, marginBottom: 32 }}>
              {message}
            </p>
            <Link
              href="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 32px",
                background: "transparent",
                border: "1px solid rgba(201,168,76,0.4)",
                color: "#c9a84c",
                fontFamily: "Arial, sans-serif",
                fontSize: 12,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              Retour à la connexion
            </Link>
          </>
        )}
      </div>
    </main>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <main style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0f",
      }}>
        <p style={{ color: "#8a8070", fontSize: 14 }}>Chargement…</p>
      </main>
    }>
      <ConfirmContent />
    </Suspense>
  )
}
