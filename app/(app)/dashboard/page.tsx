"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getRank, getNextRank, getXPProgress, calculateXP, toRoman } from "@/lib/ranks"
import { isAdminEmail } from "@/lib/admin"

type Tab = "overview" | "account" | "security" | "history"

const PAGE_SIZE = 10

export default function DashboardPage() {
  const [user,        setUser]        = useState<any>(null)
  const [profile,     setProfile]     = useState<any>(null)
  const [sessions,    setSessions]    = useState<any[]>([])
  const [loading,     setLoading]     = useState(true)
  const [activeTab,   setActiveTab]   = useState<Tab>("overview")

  // Account tab state
  const [firstName,   setFirstName]   = useState("")
  const [saveMsg,     setSaveMsg]     = useState<string|null>(null)
  const [saveLoading, setSaveLoading] = useState(false)

  // Security tab state
  const [newPassword, setNewPassword] = useState("")
  const [confirmPwd,  setConfirmPwd]  = useState("")
  const [pwdMsg,      setPwdMsg]      = useState<{type:"success"|"error", text:string}|null>(null)
  const [pwdLoading,  setPwdLoading]  = useState(false)

  // Cancel subscription state
  const [cancelStep,     setCancelStep]     = useState<0|1>(0) // 0=closed, 1=confirm
  const [cancelMsg,      setCancelMsg]      = useState<{type:"success"|"error", text:string}|null>(null)
  const [cancelLoading,  setCancelLoading]  = useState(false)

  // Delete account state
  const [deleteStep,     setDeleteStep]     = useState<0|1|2>(0) // 0=closed, 1=confirm, 2=enter pwd
  const [deletePassword, setDeletePassword] = useState("")
  const [deleteMsg,      setDeleteMsg]      = useState<{type:"success"|"error", text:string}|null>(null)
  const [deleteLoading,  setDeleteLoading]  = useState(false)

  // History tab state
  const [histPage,    setHistPage]    = useState(0)
  const [expandedId,  setExpandedId]  = useState<string|null>(null)
  const [allSessions, setAllSessions] = useState<any[]>([])
  const [histLoading, setHistLoading] = useState(false)
  const [histLoaded,  setHistLoaded]  = useState(false)

  const supabase = createClient()
  const router   = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      setUser(user)
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      setProfile(profile)
      setFirstName(profile?.first_name || "")
      const { data: sessions, error: sessionsError } = await supabase
        .from("analysis_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)
      if (sessionsError) {
        console.error("[dashboard] sessions load error:", sessionsError)
      }
      setSessions(sessions || [])
      setLoading(false)
    }
    load()
  }, [])

  const loadAllSessions = async (userId: string) => {
    setHistLoading(true)
    const { data, error } = await supabase
      .from("analysis_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    if (error) {
      console.error("[dashboard] loadAllSessions error:", error)
    }
    setAllSessions(data || [])
    setHistLoaded(true)
    setHistLoading(false)
  }

  useEffect(() => {
    if (activeTab === "history" && user && !histLoaded && !histLoading) {
      loadAllSessions(user.id)
    }
  }, [activeTab, user])

  const logout = async () => { await supabase.auth.signOut(); router.push("/") }

  const saveAccount = async () => {
    if (!user) return
    setSaveLoading(true)
    setSaveMsg(null)
    const { error } = await supabase
      .from("profiles")
      .update({ first_name: firstName })
      .eq("id", user.id)
    setSaveLoading(false)
    setSaveMsg(error ? "Erreur lors de la sauvegarde." : "Modifications enregistrées.")
    setTimeout(() => setSaveMsg(null), 3000)
  }

  const changePassword = async () => {
    setPwdMsg(null)
    if (newPassword.length < 8) {
      setPwdMsg({ type: "error", text: "Le mot de passe doit contenir au moins 8 caractères." })
      return
    }
    if (newPassword !== confirmPwd) {
      setPwdMsg({ type: "error", text: "Les mots de passe ne correspondent pas." })
      return
    }
    setPwdLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPwdLoading(false)
    if (error) {
      setPwdMsg({ type: "error", text: error.message })
    } else {
      setPwdMsg({ type: "success", text: "Mot de passe mis à jour avec succès." })
      setNewPassword("")
      setConfirmPwd("")
    }
  }

  const cancelSubscription = async () => {
    setCancelMsg(null)
    setCancelLoading(true)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      setCancelLoading(false)
      setCancelMsg({ type: "error", text: "Impossible de récupérer la session. Réessayez." })
      return
    }

    const res = await fetch("/api/user/cancel-subscription", {
      method: "POST",
      headers: { "Authorization": `Bearer ${session.access_token}` },
    })

    const data = await res.json()
    setCancelLoading(false)

    if (!res.ok || !data.ok) {
      setCancelMsg({ type: "error", text: data.error || "Erreur lors de la résiliation." })
      return
    }

    setCancelMsg({ type: "success", text: data.message })
    setCancelStep(0)
    // Refresh profile to reflect plan change
    const { data: updatedProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    if (updatedProfile) setProfile(updatedProfile)
  }

  const deleteAccount = async () => {
    setDeleteMsg(null)
    if (!deletePassword) {
      setDeleteMsg({ type: "error", text: "Veuillez entrer votre mot de passe." })
      return
    }
    setDeleteLoading(true)

    // Re-authenticate to get a fresh session token
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email || "",
      password: deletePassword,
    })
    if (signInError) {
      setDeleteLoading(false)
      setDeleteMsg({ type: "error", text: "Mot de passe incorrect." })
      return
    }

    // Get fresh session token
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      setDeleteLoading(false)
      setDeleteMsg({ type: "error", text: "Impossible de récupérer la session. Réessayez." })
      return
    }

    const res = await fetch("/api/user/delete-account", {
      method: "POST",
      headers: { "Authorization": `Bearer ${session.access_token}` },
    })

    const data = await res.json()
    setDeleteLoading(false)

    if (!res.ok || !data.ok) {
      setDeleteMsg({ type: "error", text: data.error || "Erreur lors de la suppression du compte." })
      return
    }

    await supabase.auth.signOut()
    router.push("/?deleted=1")
  }

  if (loading) return (
    <main style={{minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center"}}>
      <div style={{width:32, height:32, border:"1px solid rgba(201,168,76,0.3)", borderTop:"1px solid #c9a84c", borderRadius:"50%", animation:"spin 1s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  )

  const xp   = calculateXP(profile, sessions)
  const rank = getRank(xp)
  const next = getNextRank(xp)
  const pct  = getXPProgress(xp)

  const scoredSessions = sessions.filter(s => typeof s.feedback?.scores?.global === "number")
  const avgScore = scoredSessions.length > 0
    ? scoredSessions.reduce((acc, s) => acc + s.feedback.scores.global, 0) / scoredSessions.length
    : 0

  const thisMonth = sessions.filter(s => {
    const d = new Date(s.created_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const histStart = histPage * PAGE_SIZE
  const histSlice = allSessions.slice(histStart, histStart + PAGE_SIZE)

  const initials = ((profile?.first_name || user?.email || "U") as string)
    .split(/[\s@]/)
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() || "")
    .join("")
    .slice(0, 2) || "U"

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview", label: "Vue d'ensemble" },
    { id: "account",  label: "Mon compte" },
    { id: "security", label: "Sécurité" },
    { id: "history",  label: "Mes analyses" },
  ]

  return (
    <main style={{minHeight:"100vh", padding:"80px 48px", maxWidth:1000, margin:"0 auto"}}>

      {/* Header */}
      <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:32}}>
        <div>
          <div className="eyebrow" style={{marginBottom:12}}>Espace personnel</div>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(28px,3.5vw,42px)", fontWeight:300, lineHeight:1.1}}>
            {profile?.first_name ? `Bonjour, ${profile.first_name}` : user?.email}
          </h1>
        </div>
        <div style={{display:"flex", alignItems:"center", gap:20}}>
          <div style={{
            border:`1px solid ${(profile?.plan === "basique" || profile?.plan === "illimite") ? "rgba(201,168,76,0.5)" : "rgba(201,168,76,0.15)"}`,
            padding:"6px 16px",
            fontFamily:"'Raleway',sans-serif",
            fontSize:10, letterSpacing:"0.25em", textTransform:"uppercase" as const,
            color: (profile?.plan === "basique" || profile?.plan === "illimite") ? "#c9a84c" : "#6a6258",
          }}>
            {profile?.plan === "illimite" ? "Illimité" : profile?.plan === "basique" ? "Basique" : "Gratuit"}
          </div>
          <button onClick={logout} className="btn-ghost" style={{fontSize:10}}>Déconnexion</button>
        </div>
      </div>

      {/* Tab navigation */}
      <div style={{
        display:"flex", gap:0,
        borderBottom:"1px solid rgba(201,168,76,0.15)",
        marginBottom:40,
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background:"none", border:"none", cursor:"pointer",
              padding:"12px 24px",
              fontFamily:"'Raleway',sans-serif",
              fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase" as const,
              color: activeTab === tab.id ? "#c9a84c" : "#6a6258",
              borderBottom: activeTab === tab.id ? "2px solid #c9a84c" : "2px solid transparent",
              marginBottom:-1,
              transition:"color 0.2s",
            }}
            onMouseEnter={e => { if (activeTab !== tab.id) (e.currentTarget as HTMLElement).style.color = "#8a8070" }}
            onMouseLeave={e => { if (activeTab !== tab.id) (e.currentTarget as HTMLElement).style.color = "#6a6258" }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── TAB: VUE D'ENSEMBLE ─── */}
      {activeTab === "overview" && (
        <div>
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

          {/* Rang card */}
          <div style={{
            border:`1px solid ${rank.color}33`,
            padding:"32px 40px",
            marginBottom:32,
            background:`${rank.color}08`,
            display:"flex", alignItems:"center", justifyContent:"space-between", gap:32, flexWrap:"wrap" as const,
          }}>
            <div>
              <p style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.3em", textTransform:"uppercase" as const, color:"#6a6258", marginBottom:8}}>Rang actuel</p>
              <div style={{display:"flex", alignItems:"baseline", gap:16, marginBottom:8}}>
                <span style={{
                  fontFamily:"'Cormorant Garamond',serif",
                  fontSize:52, fontWeight:300, lineHeight:1,
                  color: rank.color,
                }}>{toRoman(rank.level)}</span>
                <span style={{
                  fontFamily:"'Cormorant Garamond',serif",
                  fontSize:28, fontWeight:300,
                  color: rank.color,
                }}>{rank.title}</span>
              </div>
              <p style={{fontSize:12, color:"#6a6258"}}>{xp} XP total</p>
            </div>
            <div style={{flex:1, minWidth:200}}>
              <div style={{display:"flex", justifyContent:"space-between", marginBottom:8}}>
                <span style={{fontSize:11, color:"#6a6258", fontFamily:"'Raleway',sans-serif", letterSpacing:"0.1em"}}>
                  {next ? `Vers ${next.title}` : "Rang maximum atteint"}
                </span>
                <span style={{fontSize:11, color:"#c9a84c"}}>{pct}%</span>
              </div>
              <div style={{height:4, background:"rgba(201,168,76,0.1)", borderRadius:2}}>
                <div style={{
                  height:"100%", width:`${pct}%`,
                  background:`linear-gradient(90deg, ${rank.color}, #c9a84c)`,
                  borderRadius:2, transition:"width 0.6s ease",
                }}/>
              </div>
              {next && (
                <p style={{fontSize:11, color:"#6a6258", marginTop:8}}>
                  {next.minXP - xp} XP restants
                </p>
              )}
            </div>
          </div>

          {/* Stats globales */}
          <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:40}}>
            {[
              { label:"Total analyses", value: sessions.length },
              { label:"Score moyen",    value: scoredSessions.length > 0 ? `${avgScore.toFixed(1)}/10` : "—" },
              { label:"Ce mois-ci",     value: thisMonth },
              { label:"XP total",       value: xp },
            ].map((stat, i) => (
              <div key={i} style={{
                border:"1px solid rgba(201,168,76,0.15)",
                padding:"24px 20px",
                textAlign:"center",
              }}>
                <p style={{fontFamily:"'Cormorant Garamond',serif", fontSize:32, fontWeight:300, color:"#c9a84c", marginBottom:4}}>{stat.value}</p>
                <p style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase" as const, color:"#6a6258"}}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* 5 dernières analyses */}
          <div style={{marginBottom:40}}>
            <p style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.3em", textTransform:"uppercase" as const, color:"#6a6258", marginBottom:20}}>
              Dernières analyses
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
                {sessions.slice(0, 5).map((s, i) => (
                  <div key={s.id} style={{
                    display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"16px 24px",
                    borderBottom: i < Math.min(sessions.length, 5) - 1 ? "1px solid rgba(201,168,76,0.08)" : "none",
                    transition:"background 0.3s",
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.02)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                    <div>
                      <p style={{fontFamily:"'Cormorant Garamond',serif", fontSize:16, marginBottom:2, color:"#f5f0e8", textTransform:"capitalize" as const}}>{s.context || "Général"}</p>
                      <p style={{fontSize:10, color:"#6a6258", letterSpacing:"0.1em"}}>
                        {new Date(s.created_at).toLocaleDateString("fr-FR", {day:"2-digit", month:"long", year:"numeric"})}
                        {s.duration_s ? ` · ${s.duration_s}s` : ""}
                      </p>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <p style={{fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:300, color:"#c9a84c"}}>
                        {s.feedback?.scores?.global ?? "—"}<span style={{fontSize:11, color:"rgba(201,168,76,0.4)"}}>/10</span>
                      </p>
                      {s.metrics?.speech_rate_wpm && (
                        <p style={{fontSize:10, color:"#6a6258"}}>{s.metrics.speech_rate_wpm} mots/min</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Accès rapides */}
          <div>
            <p style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.3em", textTransform:"uppercase" as const, color:"#6a6258", marginBottom:20}}>Accès rapide</p>
            <div style={{display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8}}>
              {[
                { label:"Analyser",        sub:"Enregistrement vocal",      href:"/record"          },
                { label:"Joute verbale",   sub:"5 scénarios d'élite",       href:"/simulate"        },
                { label:"Entraînement",    sub:"500 sujets philosophiques",  href:"/training"        },
                { label:"Mon discours",    sub:"Réécriture oratoire",       href:"/speech-analysis" },
                { label:"Cas pratiques",   sub:"Légifrance × Thémis",       href:"/legifrance"      },
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
          </div>
        </div>
      )}

      {/* ─── TAB: MON COMPTE ─── */}
      {activeTab === "account" && (
        <div style={{maxWidth:560}}>
          {/* Avatar */}
          <div style={{display:"flex", alignItems:"center", gap:24, marginBottom:40}}>
            <div style={{
              width:72, height:72, borderRadius:"50%",
              background:"rgba(201,168,76,0.1)",
              border:"1px solid rgba(201,168,76,0.3)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:300, color:"#c9a84c",
              flexShrink:0,
            }}>
              {initials}
            </div>
            <div>
              <p style={{fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:300, marginBottom:4}}>{profile?.first_name || user?.email}</p>
              <p style={{fontSize:11, color:"#6a6258"}}>{user?.email}</p>
            </div>
          </div>

          <div style={{height:1, background:"rgba(201,168,76,0.15)", marginBottom:32}}/>

          {/* Fields */}
          <div style={{display:"flex", flexDirection:"column", gap:24}}>
            <div>
              <label style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase" as const, color:"#6a6258", display:"block", marginBottom:8}}>
                Email
              </label>
              <div style={{
                border:"1px solid rgba(201,168,76,0.15)",
                padding:"12px 16px",
                fontSize:13, color:"#6a6258",
                background:"rgba(0,0,0,0.2)",
              }}>
                {user?.email}
              </div>
            </div>

            <div>
              <label style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase" as const, color:"#6a6258", display:"block", marginBottom:8}}>
                Prénom
              </label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="Votre prénom"
                style={{
                  width:"100%", boxSizing:"border-box" as const,
                  border:"1px solid rgba(201,168,76,0.25)",
                  padding:"12px 16px",
                  background:"transparent",
                  color:"#f5f0e8",
                  fontSize:13,
                  outline:"none",
                  fontFamily:"'Raleway',sans-serif",
                }}
              />
            </div>

            <div>
              <label style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase" as const, color:"#6a6258", display:"block", marginBottom:8}}>
                Plan actuel
              </label>
              <div style={{display:"flex", alignItems:"center", gap:16}}>
                <div style={{
                  border:`1px solid ${(profile?.plan === "basique" || profile?.plan === "illimite") ? "rgba(201,168,76,0.5)" : "rgba(201,168,76,0.15)"}`,
                  padding:"8px 18px",
                  fontFamily:"'Raleway',sans-serif",
                  fontSize:10, letterSpacing:"0.25em", textTransform:"uppercase" as const,
                  color: (profile?.plan === "basique" || profile?.plan === "illimite") ? "#c9a84c" : "#6a6258",
                }}>
                  {profile?.plan === "illimite" ? "Illimité" : profile?.plan === "basique" ? "Basique" : "Gratuit"}
                </div>
                {profile?.plan !== "illimite" && (
                  <Link href="/pricing" style={{fontSize:11, color:"#c9a84c", letterSpacing:"0.05em", textDecoration:"none"}}>Changer de plan →</Link>
                )}
              </div>
            </div>

            <div>
              <label style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase" as const, color:"#6a6258", display:"block", marginBottom:8}}>
                Membre depuis
              </label>
              <p style={{fontSize:13, color:"#8a8070"}}>
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("fr-FR", {day:"numeric", month:"long", year:"numeric"})
                  : "—"}
              </p>
            </div>
          </div>

          <div style={{marginTop:32, display:"flex", alignItems:"center", gap:16}}>
            <button
              onClick={saveAccount}
              disabled={saveLoading}
              className="btn-gold"
            >
              <span className="btn-text">{saveLoading ? "Enregistrement..." : "Enregistrer les modifications"}</span>
            </button>
            {saveMsg && (
              <p style={{fontSize:12, color: saveMsg.includes("Erreur") ? "#c97a4c" : "#c9a84c"}}>{saveMsg}</p>
            )}
          </div>

          {/* ─── Administration ─── */}
          {isAdminEmail(user?.email) && (
            <>
              <div style={{height:1, background:"rgba(201,168,76,0.15)", marginTop:40, marginBottom:32}}/>
              <p style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.3em", textTransform:"uppercase" as const, color:"#6a6258", marginBottom:20}}>
                Administration
              </p>
              <Link
                href="/admin/beta-testers"
                style={{
                  display:"inline-block",
                  border:"1px solid rgba(201,168,76,0.4)",
                  color:"#c9a84c",
                  padding:"10px 20px",
                  fontFamily:"'Raleway',sans-serif",
                  fontSize:10,
                  letterSpacing:"0.2em",
                  textTransform:"uppercase" as const,
                  textDecoration:"none",
                  transition:"all 0.3s",
                  background:"transparent",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.08)" }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
              >
                🛡️ Gérer les béta testeurs
              </Link>
            </>
          )}

          {/* ─── Abonnement ─── */}
          {(profile?.plan === "basique" || profile?.plan === "illimite") && (
            <>
              <div style={{height:1, background:"rgba(201,168,76,0.15)", marginTop:40, marginBottom:32}}/>

              <p style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.3em", textTransform:"uppercase" as const, color:"#6a6258", marginBottom:20}}>
                Mon abonnement
              </p>

              <div style={{border:"1px solid rgba(201,168,76,0.2)", padding:"20px 24px", background:"rgba(201,168,76,0.02)", marginBottom:16}}>
                <p style={{fontSize:13, color:"#8a8070", lineHeight:1.7, marginBottom:0}}>
                  Votre abonnement <strong style={{color:"#f5f0e8"}}>{profile?.plan === "illimite" ? "Illimité" : "Basique"}</strong> est actif. Vous pouvez le résilier à tout moment. L&apos;accès reste disponible jusqu&apos;à la fin de la période mensuelle en cours.
                </p>
              </div>

              {cancelMsg && (
                <p style={{fontSize:12, color: cancelMsg.type === "error" ? "#c97a4c" : "#c9a84c", marginBottom:16}}>
                  {cancelMsg.text}
                </p>
              )}

              <button
                onClick={() => { setCancelStep(1); setCancelMsg(null) }}
                style={{
                  background:"transparent",
                  border:"1px solid rgba(201,90,50,0.4)",
                  color:"#c97a4c",
                  padding:"10px 20px",
                  fontFamily:"'Raleway',sans-serif",
                  fontSize:10,
                  letterSpacing:"0.2em",
                  textTransform:"uppercase" as const,
                  cursor:"pointer",
                  transition:"all 0.3s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(201,90,50,0.08)" }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
              >
                Résilier mon abonnement
              </button>
            </>
          )}
        </div>
      )}

      {/* ─── TAB: SÉCURITÉ ─── */}
      {activeTab === "security" && (
        <div style={{maxWidth:560}}>
          {/* Changer le mot de passe */}
          <p style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.3em", textTransform:"uppercase" as const, color:"#6a6258", marginBottom:24}}>
            Changer le mot de passe
          </p>

          <div style={{display:"flex", flexDirection:"column", gap:20, marginBottom:32}}>
            <div>
              <label style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase" as const, color:"#6a6258", display:"block", marginBottom:8}}>
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Minimum 8 caractères"
                style={{
                  width:"100%", boxSizing:"border-box" as const,
                  border:"1px solid rgba(201,168,76,0.25)",
                  padding:"12px 16px",
                  background:"transparent",
                  color:"#f5f0e8",
                  fontSize:13,
                  outline:"none",
                  fontFamily:"'Raleway',sans-serif",
                }}
              />
            </div>

            <div>
              <label style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase" as const, color:"#6a6258", display:"block", marginBottom:8}}>
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={confirmPwd}
                onChange={e => setConfirmPwd(e.target.value)}
                placeholder="Répétez le mot de passe"
                style={{
                  width:"100%", boxSizing:"border-box" as const,
                  border:"1px solid rgba(201,168,76,0.25)",
                  padding:"12px 16px",
                  background:"transparent",
                  color:"#f5f0e8",
                  fontSize:13,
                  outline:"none",
                  fontFamily:"'Raleway',sans-serif",
                }}
              />
            </div>
          </div>

          <div style={{display:"flex", alignItems:"center", gap:16, marginBottom:40}}>
            <button
              onClick={changePassword}
              disabled={pwdLoading}
              className="btn-outline"
            >
              {pwdLoading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
            </button>
            {pwdMsg && (
              <p style={{fontSize:12, color: pwdMsg.type === "error" ? "#c97a4c" : "#c9a84c"}}>{pwdMsg.text}</p>
            )}
          </div>

          <div style={{height:1, background:"rgba(201,168,76,0.15)", marginBottom:32}}/>

          {/* Méthodes de connexion */}
          <p style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.3em", textTransform:"uppercase" as const, color:"#6a6258", marginBottom:20}}>
            Méthodes de connexion
          </p>
          <div style={{
            border:"1px solid rgba(201,168,76,0.15)",
            padding:"16px 20px",
            display:"flex", alignItems:"center", gap:12, marginBottom:32,
          }}>
            <span style={{fontSize:16}}>
              {user?.app_metadata?.provider === "google" ? "🔵" : "📧"}
            </span>
            <span style={{fontSize:13, color:"#f5f0e8", textTransform:"capitalize" as const}}>
              {user?.app_metadata?.provider || "email"}
            </span>
          </div>

          {/* Dernière connexion */}
          <p style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.3em", textTransform:"uppercase" as const, color:"#6a6258", marginBottom:12}}>
            Dernière connexion
          </p>
          <p style={{fontSize:13, color:"#8a8070"}}>
            {user?.last_sign_in_at
              ? new Date(user.last_sign_in_at).toLocaleDateString("fr-FR", {weekday:"long", day:"numeric", month:"long", year:"numeric", hour:"2-digit", minute:"2-digit"})
              : "—"}
          </p>

          <div style={{height:1, background:"rgba(201,168,76,0.15)", marginBottom:32, marginTop:40}}/>

          {/* Zone de danger — Suppression du compte */}
          <p style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.3em", textTransform:"uppercase" as const, color:"#c97a4c", marginBottom:16}}>
            Zone de danger
          </p>
          <div style={{border:"1px solid rgba(201,90,50,0.25)", padding:"20px 24px", background:"rgba(201,90,50,0.03)"}}>
            <p style={{fontSize:13, color:"#8a8070", lineHeight:1.7, marginBottom:20}}>
              La suppression de votre compte est <strong style={{color:"#f5f0e8"}}>irréversible</strong>. Toutes vos données (profil, analyses, historiques) seront définitivement effacées conformément au RGPD (Art. 17). Les factures restent conservées 6 ans (obligation légale).
            </p>
            <button
              onClick={() => { setDeleteStep(1); setDeleteMsg(null) }}
              style={{
                background:"transparent",
                border:"1px solid rgba(201,90,50,0.5)",
                color:"#c97a4c",
                padding:"10px 20px",
                fontFamily:"'Raleway',sans-serif",
                fontSize:10,
                letterSpacing:"0.2em",
                textTransform:"uppercase" as const,
                cursor:"pointer",
                transition:"all 0.3s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(201,90,50,0.1)" }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
            >
              ⚠ Supprimer définitivement mon compte
            </button>
          </div>
        </div>
      )}

      {/* ─── MODAL: RÉSILIATION D'ABONNEMENT ─── */}
      {cancelStep === 1 && (
        <div style={{
          position:"fixed", inset:0, zIndex:1000,
          background:"rgba(10,10,15,0.92)",
          display:"flex", alignItems:"center", justifyContent:"center",
          padding:"20px",
        }}>
          <div style={{
            background:"#0d0d14",
            border:"1px solid rgba(201,168,76,0.25)",
            padding:"40px",
            maxWidth:480,
            width:"100%",
          }}>
            <p style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.3em", textTransform:"uppercase" as const, color:"#c9a84c", marginBottom:20}}>
              Confirmation requise
            </p>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:300, color:"#f5f0e8", marginBottom:16, lineHeight:1.2}}>
              Résilier votre abonnement ?
            </h2>
            <p style={{fontSize:13, color:"#8a8070", lineHeight:1.8, marginBottom:28}}>
              Vous continuerez à avoir accès jusqu&apos;à la fin de votre période mensuelle en cours. Après cette date, votre compte basculera automatiquement en forfait gratuit. Aucun remboursement ne sera effectué pour la période déjà payée.
            </p>
            {cancelMsg && (
              <p style={{fontSize:12, color: cancelMsg.type === "error" ? "#c97a4c" : "#c9a84c", marginBottom:16}}>
                {cancelMsg.text}
              </p>
            )}
            <div style={{display:"flex", gap:12}}>
              <button
                onClick={() => { setCancelStep(0); setCancelMsg(null) }}
                disabled={cancelLoading}
                style={{
                  flex:1, padding:"12px", background:"transparent",
                  border:"1px solid rgba(201,168,76,0.25)",
                  color:"#6a6258", fontSize:11, letterSpacing:"0.15em",
                  textTransform:"uppercase" as const,
                  fontFamily:"'Raleway',sans-serif", cursor:"pointer",
                }}
              >
                Annuler
              </button>
              <button
                onClick={cancelSubscription}
                disabled={cancelLoading}
                style={{
                  flex:1, padding:"12px", background:"rgba(201,90,50,0.1)",
                  border:"1px solid rgba(201,90,50,0.4)",
                  color:"#c97a4c", fontSize:11, letterSpacing:"0.15em",
                  textTransform:"uppercase" as const,
                  fontFamily:"'Raleway',sans-serif", cursor: cancelLoading ? "not-allowed" : "pointer",
                  opacity: cancelLoading ? 0.6 : 1,
                }}
              >
                {cancelLoading ? "Résiliation..." : "Confirmer la résiliation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: SUPPRESSION DU COMPTE ─── */}
      {deleteStep > 0 && (
        <div style={{
          position:"fixed", inset:0, zIndex:1000,
          background:"rgba(10,10,15,0.92)",
          display:"flex", alignItems:"center", justifyContent:"center",
          padding:"20px",
        }}>
          <div style={{
            background:"#0d0d14",
            border:"1px solid rgba(201,90,50,0.3)",
            padding:"40px",
            maxWidth:480,
            width:"100%",
          }}>
            {deleteStep === 1 && (
              <>
                <p style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.3em", textTransform:"uppercase" as const, color:"#c97a4c", marginBottom:20}}>
                  Confirmation requise
                </p>
                <h2 style={{fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:300, color:"#f5f0e8", marginBottom:16, lineHeight:1.2}}>
                  Supprimer votre compte ?
                </h2>
                <p style={{fontSize:13, color:"#8a8070", lineHeight:1.8, marginBottom:28}}>
                  Cette action est <strong style={{color:"#f5f0e8"}}>irréversible</strong>. Toutes vos données personnelles, analyses et historiques seront définitivement supprimés. Vos enregistrements audio sont déjà supprimés immédiatement après chaque analyse.
                </p>
                <div style={{display:"flex", gap:12}}>
                  <button
                    onClick={() => { setDeleteStep(0); setDeleteMsg(null) }}
                    style={{
                      flex:1, padding:"12px", background:"transparent",
                      border:"1px solid rgba(201,168,76,0.25)",
                      color:"#6a6258", fontSize:11, letterSpacing:"0.15em",
                      textTransform:"uppercase" as const,
                      fontFamily:"'Raleway',sans-serif", cursor:"pointer",
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => setDeleteStep(2)}
                    style={{
                      flex:1, padding:"12px", background:"rgba(201,90,50,0.15)",
                      border:"1px solid rgba(201,90,50,0.5)",
                      color:"#c97a4c", fontSize:11, letterSpacing:"0.15em",
                      textTransform:"uppercase" as const,
                      fontFamily:"'Raleway',sans-serif", cursor:"pointer",
                    }}
                  >
                    Continuer
                  </button>
                </div>
              </>
            )}

            {deleteStep === 2 && (
              <>
                <p style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.3em", textTransform:"uppercase" as const, color:"#c97a4c", marginBottom:20}}>
                  Étape finale — Confirmation du mot de passe
                </p>
                <h2 style={{fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:300, color:"#f5f0e8", marginBottom:16, lineHeight:1.2}}>
                  Confirmez votre identité
                </h2>
                <p style={{fontSize:13, color:"#8a8070", lineHeight:1.8, marginBottom:24}}>
                  Entrez votre mot de passe pour confirmer la suppression définitive de votre compte.
                </p>
                <div style={{marginBottom:24}}>
                  <label style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase" as const, color:"#6a6258", display:"block", marginBottom:8}}>
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={e => setDeletePassword(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") deleteAccount() }}
                    placeholder="Votre mot de passe"
                    style={{
                      width:"100%", boxSizing:"border-box" as const,
                      border:"1px solid rgba(201,90,50,0.35)",
                      padding:"12px 16px",
                      background:"transparent",
                      color:"#f5f0e8",
                      fontSize:13,
                      outline:"none",
                      fontFamily:"'Raleway',sans-serif",
                    }}
                  />
                </div>
                {deleteMsg && (
                  <p style={{fontSize:12, color: deleteMsg.type === "error" ? "#c97a4c" : "#c9a84c", marginBottom:16}}>
                    {deleteMsg.text}
                  </p>
                )}
                <div style={{display:"flex", gap:12}}>
                  <button
                    onClick={() => { setDeleteStep(0); setDeletePassword(""); setDeleteMsg(null) }}
                    disabled={deleteLoading}
                    style={{
                      flex:1, padding:"12px", background:"transparent",
                      border:"1px solid rgba(201,168,76,0.25)",
                      color:"#6a6258", fontSize:11, letterSpacing:"0.15em",
                      textTransform:"uppercase" as const,
                      fontFamily:"'Raleway',sans-serif", cursor:"pointer",
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={deleteAccount}
                    disabled={deleteLoading}
                    style={{
                      flex:1, padding:"12px", background:"rgba(201,90,50,0.2)",
                      border:"1px solid rgba(201,90,50,0.6)",
                      color:"#c97a4c", fontSize:11, letterSpacing:"0.15em",
                      textTransform:"uppercase" as const,
                      fontFamily:"'Raleway',sans-serif", cursor: deleteLoading ? "not-allowed" : "pointer",
                      opacity: deleteLoading ? 0.6 : 1,
                    }}
                  >
                    {deleteLoading ? "Suppression..." : "Supprimer définitivement"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB: MES ANALYSES ─── */}
      {activeTab === "history" && (
        <div>
          <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24}}>
            <p style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.3em", textTransform:"uppercase" as const, color:"#6a6258"}}>
              Toutes les analyses ({allSessions.length})
            </p>
            <div style={{display:"flex", gap:8}}>
              <button
                onClick={() => { setHistLoaded(false); setAllSessions([]); loadAllSessions(user.id) }}
                disabled={histLoading}
                style={{
                  border:"1px solid rgba(201,168,76,0.15)",
                  padding:"8px 16px",
                  background:"transparent",
                  color:"#6a6258",
                  fontSize:10,
                  fontFamily:"'Raleway',sans-serif",
                  letterSpacing:"0.15em",
                  textTransform:"uppercase" as const,
                  cursor: histLoading ? "not-allowed" : "pointer",
                }}
              >
                {histLoading ? "..." : "↻"}
              </button>
              <button
                disabled={profile?.plan !== "illimite"}
                title={profile?.plan !== "illimite" ? "Export PDF disponible avec le plan Illimité" : undefined}
                style={{
                  border:"1px solid rgba(201,168,76,0.15)",
                  padding:"8px 16px",
                  background:"transparent",
                  color: profile?.plan === "illimite" ? "#c9a84c" : "#3a3830",
                  fontSize:10,
                  fontFamily:"'Raleway',sans-serif",
                  letterSpacing:"0.15em",
                  textTransform:"uppercase" as const,
                  cursor: profile?.plan === "illimite" ? "pointer" : "not-allowed",
                }}
              >
                Export PDF {profile?.plan !== "illimite" && "🔒"}
              </button>
            </div>
          </div>

          {histLoading ? (
            <div style={{display:"flex", justifyContent:"center", padding:"48px"}}>
              <div style={{width:24, height:24, border:"1px solid rgba(201,168,76,0.3)", borderTop:"1px solid #c9a84c", borderRadius:"50%", animation:"spin 1s linear infinite"}}/>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : allSessions.length === 0 ? (
            <div style={{border:"1px solid rgba(201,168,76,0.1)", padding:"48px", textAlign:"center"}}>
              <p className="ornament" style={{marginBottom:16}}>✦</p>
              <p style={{fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontStyle:"italic", color:"#6a6258"}}>Aucune analyse pour l&apos;instant.</p>
              <p style={{fontSize:12, color:"#6a6258", marginTop:8}}>Lancez votre premier enregistrement.</p>
              <Link href="/record" className="btn-outline" style={{display:"inline-flex", marginTop:24}}><span>Commencer</span></Link>
            </div>
          ) : (
            <>
              <div style={{border:"1px solid rgba(201,168,76,0.15)"}}>
                {histSlice.map((s, i) => (
                  <div key={s.id}>
                    <div
                      onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                      style={{
                        display:"flex", alignItems:"center", justifyContent:"space-between",
                        padding:"20px 28px",
                        borderBottom: (expandedId === s.id || i < histSlice.length - 1) ? "1px solid rgba(201,168,76,0.08)" : "none",
                        transition:"background 0.3s", cursor:"pointer",
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.02)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                    >
                      <div>
                        <p style={{fontFamily:"'Cormorant Garamond',serif", fontSize:17, marginBottom:4, color:"#f5f0e8", textTransform:"capitalize" as const}}>{s.context || "Général"}</p>
                        <p style={{fontSize:10, color:"#6a6258", letterSpacing:"0.1em"}}>
                          {new Date(s.created_at).toLocaleDateString("fr-FR", {weekday:"long", day:"2-digit", month:"long", year:"numeric"})}
                          {s.duration_s ? ` · ${s.duration_s}s` : ""}
                          {s.metrics?.speech_rate_wpm ? ` · ${s.metrics.speech_rate_wpm} mots/min` : ""}
                        </p>
                      </div>
                      <div style={{display:"flex", alignItems:"center", gap:16}}>
                        <div style={{textAlign:"right"}}>
                          <p style={{fontFamily:"'Cormorant Garamond',serif", fontSize:24, fontWeight:300, color:"#c9a84c"}}>
                            {s.feedback?.scores?.global ?? "—"}<span style={{fontSize:12, color:"rgba(201,168,76,0.4)"}}>/10</span>
                          </p>
                        </div>
                        <span style={{color:"#6a6258", fontSize:10}}>{expandedId === s.id ? "▲" : "▼"}</span>
                      </div>
                    </div>
                    {expandedId === s.id && s.feedback?.recommendations && (
                      <div style={{
                        padding:"20px 28px",
                        borderBottom: i < histSlice.length - 1 ? "1px solid rgba(201,168,76,0.08)" : "none",
                        background:"rgba(201,168,76,0.01)",
                      }}>
                        <p style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase" as const, color:"#6a6258", marginBottom:12}}>
                          Recommandations
                        </p>
                        {Array.isArray(s.feedback.recommendations) ? (
                          <ul style={{listStyle:"none", display:"flex", flexDirection:"column", gap:8}}>
                            {(s.feedback.recommendations as string[]).map((r, ri) => (
                              <li key={ri} style={{fontSize:12, color:"#8a8070", display:"flex", gap:10, lineHeight:1.7}}>
                                <span style={{color:"rgba(201,168,76,0.4)", flexShrink:0}}>◆</span>{r}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p style={{fontSize:12, color:"#8a8070", lineHeight:1.7}}>{s.feedback.recommendations}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {allSessions.length > PAGE_SIZE && (
                <div style={{display:"flex", justifyContent:"center", alignItems:"center", gap:24, marginTop:24}}>
                  <button
                    onClick={() => setHistPage(p => Math.max(0, p - 1))}
                    disabled={histPage === 0}
                    className="btn-ghost"
                    style={{fontSize:10, opacity: histPage === 0 ? 0.3 : 1}}
                  >
                    ← Page précédente
                  </button>
                  <span style={{fontSize:11, color:"#6a6258"}}>
                    Page {histPage + 1} / {Math.ceil(allSessions.length / PAGE_SIZE)}
                  </span>
                  <button
                    onClick={() => setHistPage(p => p + 1)}
                    disabled={histStart + PAGE_SIZE >= allSessions.length}
                    className="btn-ghost"
                    style={{fontSize:10, opacity: histStart + PAGE_SIZE >= allSessions.length ? 0.3 : 1}}
                  >
                    Page suivante →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

    </main>
  )
}
