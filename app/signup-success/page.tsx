"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function SignupSuccessPage() {
  const [countdown, setCountdown] = useState(5)
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(interval)
          router.push("/login")
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [router])

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
        {/* Ornement SVG microphone */}
        <div style={{ marginBottom: 32 }}>
          <svg width="56" height="56" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", margin: "0 auto" }}>
            <rect x="14" y="2" width="8" height="16" rx="4" fill="#c9a84c"/>
            <path d="M6 18 Q6 26 18 26 Q30 26 30 18" stroke="#c9a84c" strokeWidth="2.4" fill="none" strokeLinecap="round"/>
            <line x1="18" y1="26" x2="18" y2="34" stroke="#c9a84c" strokeWidth="2.4" strokeLinecap="round"/>
            <line x1="10" y1="34" x2="26" y2="34" stroke="#c9a84c" strokeWidth="2.4" strokeLinecap="round"/>
          </svg>
        </div>

        <p className="ornament" style={{ marginBottom: 24, color: "#c9a84c", fontSize: 20 }}>✦</p>

        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 40,
          fontWeight: 300,
          color: "#f5f0e8",
          marginBottom: 16,
          letterSpacing: "0.03em",
        }}>
          Compte créé
        </h1>

        <div style={{
          width: 48,
          height: 1,
          background: "linear-gradient(90deg, transparent, #c9a84c, transparent)",
          margin: "0 auto 24px",
        }} />

        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 18,
          fontStyle: "italic",
          fontWeight: 300,
          color: "#c9a84c",
          marginBottom: 16,
          lineHeight: 1.6,
        }}>
          Bienvenue sur Éloquence.fr
        </p>

        <p style={{
          fontSize: 14,
          color: "#8a8070",
          lineHeight: 1.7,
          marginBottom: 40,
          letterSpacing: "0.02em",
        }}>
          Votre compte a bien été créé. Un email de bienvenue vous a été envoyé.
          <br />
          Vous allez être redirigé vers la page de connexion dans{" "}
          <span style={{ color: "#c9a84c", fontWeight: 600 }}>{countdown}</span> seconde{countdown > 1 ? "s" : ""}.
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
            fontFamily: "'Raleway', sans-serif",
            fontSize: 12,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            textDecoration: "none",
            transition: "all 0.3s",
          }}
        >
          Se connecter maintenant
        </Link>
      </div>
    </main>
  )
}
