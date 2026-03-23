"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import Link from "next/link"

export default function Nav() {
  const [user,     setUser]     = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    const fn = () => setScrolled(window.scrollY > 30)
    window.addEventListener("scroll", fn)
    return () => window.removeEventListener("scroll", fn)
  }, [])

  return (
    <nav style={{
      position:"fixed", top:0, left:0, right:0, zIndex:100,
      height:64,
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"0 48px",
      borderBottom: scrolled ? "1px solid rgba(201,168,76,0.2)" : "1px solid transparent",
      background: scrolled ? "rgba(10,10,15,0.96)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      transition:"all 0.4s",
    }}>
      {/* Logo */}
      <Link href="/" style={{display:"flex", alignItems:"center", gap:14, textDecoration:"none"}}>
        <div style={{
          width:36, height:36,
          border:"1px solid rgba(201,168,76,0.5)",
          display:"flex", alignItems:"center", justifyContent:"center",
          transition:"border-color 0.3s",
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="8" y="1" width="4" height="9" rx="2" fill="#c9a84c"/>
            <path d="M4 10 Q4 15 10 15 Q16 15 16 10" stroke="#c9a84c" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
            <line x1="10" y1="15" x2="10" y2="19" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round"/>
            <line x1="6" y1="19" x2="14" y2="19" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </div>
        <span style={{fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:300, letterSpacing:"0.12em", color:"#f5f0e8"}}>
          Éloquence<span style={{color:"#c9a84c", fontStyle:"italic"}}>.ai</span>
        </span>
      </Link>

      {/* Links */}
      <div style={{display:"flex", gap:36}}>
        {[
          ["/record",          "Analyser"],
          ["/simulate",        "Simulation"],
          ["/training",        "Entraînement"],
          ["/speech-analysis", "Discours"],
        ].map(([href, label]) => (
          <Link key={href} href={href} style={{
            fontFamily:"'Raleway',sans-serif",
            fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase",
            color:"#6a6258", textDecoration:"none",
            transition:"color 0.3s",
          }}
          onMouseEnter={e => (e.target as HTMLElement).style.color="#c9a84c"}
          onMouseLeave={e => (e.target as HTMLElement).style.color="#6a6258"}>
            {label}
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div style={{display:"flex", alignItems:"center", gap:20}}>
        {user ? (
          <Link href="/dashboard" className="btn-gold"><span className="btn-text">Mon espace</span></Link>
        ) : (
          <>
            <Link href="/login" className="btn-ghost">Connexion</Link>
            <Link href="/login" className="btn-gold"><span className="btn-text">Commencer</span></Link>
          </>
        )}
      </div>
    </nav>
  )
}
