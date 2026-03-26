"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase"

const NAV_LINKS = [
  { href: "/record",          label: "Analyser" },
  { href: "/simulate",        label: "Joute verbale" },
  { href: "/training",        label: "Entraînement" },
  { href: "/speech-analysis", label: "Discours" },
  { href: "/pricing",         label: "Tarifs" },
]

function HamburgerSVG({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {isOpen ? (
        /* Microphone + sound waves */
        <>
          {/* Mic body */}
          <rect x="10" y="3" width="8" height="12" rx="4" fill="#c9a84c" />
          {/* Mic arc (stand) */}
          <path
            d="M6 15 Q6 22 14 22 Q22 22 22 15"
            stroke="#c9a84c"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          />
          {/* Mic stand vertical */}
          <line x1="14" y1="22" x2="14" y2="26" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round" />
          {/* Mic base */}
          <line x1="9" y1="26" x2="19" y2="26" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round" />
          {/* Sound wave 1 (inner) */}
          <path
            d="M4 13 Q4 7 14 7 Q24 7 24 13"
            stroke="#c9a84c"
            strokeWidth="1.4"
            fill="none"
            strokeLinecap="round"
            opacity="0.7"
            className="sound-wave sound-wave-1"
          />
          {/* Sound wave 2 (outer) */}
          <path
            d="M1 13 Q1 4 14 4 Q27 4 27 13"
            stroke="#c9a84c"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
            opacity="0.4"
            className="sound-wave sound-wave-2"
          />
        </>
      ) : (
        /* Burger — 3 horizontal lines */
        <>
          <line x1="4" y1="8"  x2="24" y2="8"  stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" />
          <line x1="4" y1="14" x2="24" y2="14" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" />
          <line x1="4" y1="20" x2="24" y2="20" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}

export default function MobileMenu() {
  const [isOpen, setIsOpen]   = useState(false)
  const [user,   setUser]     = useState<{ email?: string } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Close menu when pressing Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false) }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  const close = () => setIsOpen(false)

  return (
    <div className="mobile-menu-container">
      {/* Burger / Micro button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setIsOpen(o => !o)}
        aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-nav-dropdown"
      >
        <HamburgerSVG isOpen={isOpen} />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="mobile-menu-backdrop"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Dropdown */}
      <div
        id="mobile-nav-dropdown"
        className={`mobile-menu-dropdown ${isOpen ? "mobile-menu-dropdown--open" : ""}`}
        role="navigation"
        aria-label="Menu mobile"
      >
        <div className="mobile-menu-inner">
          {/* Decorative line */}
          <div className="mobile-menu-rule" />

          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="mobile-menu-link"
              onClick={close}
            >
              <span className="mobile-menu-link-arrow">›</span>
              {label}
            </Link>
          ))}

          <div className="mobile-menu-rule" style={{ margin: "12px 0" }} />

          {user ? (
            <Link href="/dashboard" className="mobile-menu-cta" onClick={close}>
              Mon espace →
            </Link>
          ) : (
            <>
              <Link href="/login" className="mobile-menu-link" onClick={close}>
                <span className="mobile-menu-link-arrow">›</span>
                Connexion
              </Link>
              <Link href="/login" className="mobile-menu-cta" onClick={close}>
                Commencer gratuitement →
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
