"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function DashboardPage() {
  const [user,     setUser]     = useState<any>(null)
  const [profile,  setProfile]  = useState<any>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)
  const supabase = createClient()
  const router   = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      setUser(user)
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      setProfile(profile)
      const { data: sessions } = await supabase.from("analysis_sessions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10)
      setSessions(sessions || [])
      setLoading(false)
    }
    load()
  }, [])

  const logout = async () => { await supabase.auth.signOut(); router.push("/") }

  if (loading) return (
    <main style={{minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center"}}>
      <div style={{width:32, height:32, border:"1px solid rgba(201,168,76,0.3)", borderTop:"1px solid #c9a84c", borderRadius:"50%", animation:"spin 1s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  )

  return (
    <main style={{minHeight:"100vh", padding:"80px 48px", maxWidth:1000, margin:"0 auto"}}>

      {/* Header */}
      <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:48}}>
        <div>
          <div className="eyebrow" style={{marginBottom:12}}>Espace personnel</div>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(32px,4vw,48px)", fontWeight:300, lineHeight:1.1}}>{user?.email}</h1>
        </div>
        <div style={{display:"flex", alignItems:"center", gap:20}}>
          <div style={{
            border:`1px solid ${(profile?.plan === "basique" || profile?.plan === "illimite") ? "rgba(201,168,76,0.5)" : "rgba(201,168,76,0.15)"}`,
            padding:"6px 16px",
            fontFamily:"'Raleway',sans-serif",
            fontSize:10, letterSpacing:"0.25em", textTransform:"uppercase",
            color: (profile?.plan === "basique" || profile?.plan === "illimite") ? "#c9a84c" : "#6a6258",
          }}>
            {profile?.plan === "illimite" ? "Illimité" : profile?.plan === "basique" ? "Basique" : "Gratuit"}
          </div>
          <button onClick={logout} className="btn-ghost" style={{fontSize:10}}>Déconnexion</button>
        </div>
      </div>

      <div style={{height:1, background:"linear-gradient(90deg,transparent,rgba(201,168,76,0.3),transparent)", marginBottom:48}}/>

      {/* CTA upgrade */}
      {profile?.plan !== "illimite" && (
        <div style={{
          border:"1px solid rgba(201,168,76,0.25)",
          padding:"28px 36px",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          marginBottom:40,
          background:"rgba(201,168,76,0.02)",
        }}>
          <div>
            {profile?.plan === "basique" ? (
              <>
                <h3 style={{fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:400, marginBottom:6}}>Passez à l&apos;Illimité pour tout débloquer</h3>
                <p style={{fontSize:12, color:"#6a6258", lineHeight:1.7}}>Analyses illimitées · Export PDF · Cas juridiques illimités</p>
              </>
            ) : (
              <>
                <h3 style={{fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:400, marginBottom:6}}>Passez au Basique ou à l&apos;Illimité</h3>
                <p style={{fontSize:12, color:"#6a6258", lineHeight:1.7}}>Débloquez toutes les fonctionnalités · Simulations · Cas pratiques</p>
              </>
            )}
          </div>
          <Link href="/pricing" className="btn-gold" style={{flexShrink:0}}><span className="btn-text">Voir les forfaits →</span></Link>
        </div>
      )}

      {/* Actions rapides */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:48}}>
        {[
          { label:"Analyser",       sub:"Enregistrement vocal",     href:"/record"          },
          { label:"Simulation",     sub:"5 scénarios d'élite",      href:"/simulate"        },
          { label:"Entraînement",   sub:"500 sujets philosophiques", href:"/training"        },
          { label:"Mon discours",   sub:"Réécriture oratoire",      href:"/speech-analysis" },
          { label:"Cas pratiques",   sub:"Légifrance × Thémis",       href:"/legifrance" },
        ].map(a => (
          <Link key={a.href} href={a.href} style={{
            border:"1px solid rgba(201,168,76,0.15)",
            padding:"20px",
            textDecoration:"none", color:"inherit",
            display:"block",
            transition:"all 0.3s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.4)"; (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.03)" }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.15)"; (e.currentTarget as HTMLElement).style.background = "transparent" }}>
            <p style={{fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:400, marginBottom:6, color:"#f5f0e8"}}>{a.label}</p>
            <p style={{fontSize:10, color:"#6a6258", letterSpacing:"0.05em", lineHeight:1.6}}>{a.sub}</p>
          </Link>
        ))}
      </div>

      {/* Historique */}
      <div>
        <p style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.3em", textTransform:"uppercase", color:"#6a6258", marginBottom:20}}>
          Historique des analyses ({sessions.length})
        </p>
        {sessions.length === 0 ? (
          <div style={{border:"1px solid rgba(201,168,76,0.1)", padding:"48px", textAlign:"center"}}>
            <p className="ornament" style={{marginBottom:16}}>✦</p>
            <p style={{fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontStyle:"italic", color:"#6a6258"}}>Aucune analyse pour l&apos;instant.</p>
            <p style={{fontSize:12, color:"#6a6258", marginTop:8}}>Lancez votre premier enregistrement.</p>
            <Link href="/record" className="btn-outline" style={{display:"inline-flex", marginTop:24}}><span>Commencer</span></Link>
          </div>
        ) : (
          <div style={{border:"1px solid rgba(201,168,76,0.15)"}}>
            {sessions.map((s, i) => (
              <div key={s.id} style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                padding:"20px 28px",
                borderBottom: i < sessions.length - 1 ? "1px solid rgba(201,168,76,0.08)" : "none",
                transition:"background 0.3s", cursor:"default",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.02)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                <div>
                  <p style={{fontFamily:"'Cormorant Garamond',serif", fontSize:17, marginBottom:4, color:"#f5f0e8", textTransform:"capitalize"}}>{s.context || "Général"}</p>
                  <p style={{fontSize:10, color:"#6a6258", letterSpacing:"0.1em"}}>
                    {new Date(s.created_at).toLocaleDateString("fr-FR", {day:"2-digit", month:"long", year:"numeric"})} · {s.duration_s}s
                  </p>
                </div>
                <div style={{textAlign:"right"}}>
                  <p style={{fontFamily:"'Cormorant Garamond',serif", fontSize:24, fontWeight:300, color:"#c9a84c"}}>{s.feedback?.scores?.global || "—"}<span style={{fontSize:12, color:"rgba(201,168,76,0.4)"}}>/10</span></p>
                  <p style={{fontSize:10, color:"#6a6258"}}>{s.metrics?.speech_rate_wpm} mots/min</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </main>
  )
}
