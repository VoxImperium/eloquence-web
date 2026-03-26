"use client"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { getPlanLimits, fetchUsage, trackUsage } from "@/lib/plan-limits"
import Link from "next/link"

const CONTEXTS = [
  { id:"general",   label:"Prise de parole", sub:"Présentation, exposé, allocution" },
  { id:"pitch",     label:"Pitch",            sub:"Devant investisseurs ou jury" },
  { id:"entretien", label:"Entretien",        sub:"Professionnel ou académique" },
]

const STEPS = ["Transcription Whisper", "Analyse rhétorique", "Feedback IA", "Rapport final"]

export default function RecordPage() {
  const [status,   setStatus]   = useState("idle")
  const [context,  setContext]  = useState("general")
  const [seconds,  setSeconds]  = useState(0)
  const [error,    setError]    = useState("")
  const [step,     setStep]     = useState(0)
  const [userId,   setUserId]   = useState<string|null>(null)
  const [plan,     setPlan]     = useState<string|null>(null)
  const [used,     setUsed]     = useState(0)

  const mrRef      = useRef(null)
  const chunksRef  = useRef([])
  const timerRef   = useRef(null)
  const stepRef    = useRef(null)
  const router     = useRouter()
  const supabase   = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login?redirect=/record"); return }
      setUserId(user.id)
      fetchUsage("vocal").then(setUsed)
      supabase.from("profiles").select("plan").eq("id", user.id).single()
        .then(({ data }) => setPlan(data?.plan ?? null))
    })
  }, [])

  useEffect(() => {
    if (status === "recording") {
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
    } else {
      clearInterval(timerRef.current)
      if (status === "idle") setSeconds(0)
    }
    return () => clearInterval(timerRef.current)
  }, [status])

  useEffect(() => {
    if (status === "analyzing") {
      let s = 0
      stepRef.current = setInterval(() => {
        s++; if (s < STEPS.length) setStep(s)
      }, 6000)
    } else {
      clearInterval(stepRef.current)
      setStep(0)
    }
    return () => clearInterval(stepRef.current)
  }, [status])

  const startRec = async () => {
    setError("")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunksRef.current = []
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" })
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = submit
      mr.start(1000)
      mrRef.current = mr
      setStatus("recording")
    } catch { setError("Impossible d'accéder au microphone. Vérifiez vos autorisations.") }
  }

  const stopRec = () => {
    mrRef.current?.stop()
    mrRef.current?.stream.getTracks().forEach(t => t.stop())
  }

  const submit = async () => {
    setStatus("analyzing")
    try {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" })
      const form = new FormData()
      form.append("audio", blob, "recording.webm")
      form.append("context", context)
      if (userId) form.append("user_id", userId)
      const res = await fetch("/api/backend/analyze", { method: "POST", body: form })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      if (userId) trackUsage("vocal").then(setUsed).catch(() => {})
      sessionStorage.setItem("lastResult", JSON.stringify(data))
      router.push("/results")
    } catch (e: any) {
      setError(e.message || "Une erreur est survenue lors de l'analyse.")
      setStatus("error")
    }
  }

  const fmt = (s: number) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`

  const limits   = getPlanLimits(plan)
  const limit    = limits.vocal
  const quotaMax = limit === Infinity ? null : limit
  const blocked  = quotaMax !== null && used >= quotaMax

  return (
    <main style={{minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"80px 24px"}}>
      <div style={{width:"100%", maxWidth:560}}>

        <div style={{marginBottom:48}}>
          <Link href="/" className="btn-ghost" style={{padding:"0 0 20px 0", display:"block"}}>← Retour</Link>
        <Link href="/legifrance" style={{fontFamily:"'Raleway',sans-serif",fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:"rgba(201,168,76,0.6)",textDecoration:"none",marginLeft:24}}>
          Plaider un cas →
        </Link>
          <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4, marginTop:16}}>
            <div className="eyebrow" style={{marginBottom:0}}>Analyse vocale</div>
            {quotaMax !== null && (
              <span style={{
                fontSize:10, letterSpacing:"0.1em", color: blocked ? "#c97a4c" : "#6a6258",
                border:`1px solid ${blocked ? "rgba(201,120,76,0.3)" : "rgba(201,168,76,0.15)"}`,
                padding:"3px 10px",
              }}>
                {used} / {quotaMax} analyses ce mois
              </span>
            )}
          </div>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(36px,5vw,52px)", fontWeight:300, lineHeight:1.1, marginBottom:12}}>
            Votre discours,<br/><em style={{color:"#c9a84c"}}>analysé</em>
          </h1>
          <p style={{fontSize:13, color:"#6a6258", lineHeight:1.9}}>Parlez librement. L&apos;IA capte chaque nuance.</p>
        </div>

        <div className="rule-gold" style={{marginBottom:40}}/>

        {/* Contexte */}
        {status === "idle" && (
          <div style={{marginBottom:40}}>
            <label className="label-oratoire" style={{marginBottom:16}}>Contexte de la prise de parole</label>
            <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8}}>
              {CONTEXTS.map(c => (
                <button key={c.id} onClick={() => setContext(c.id)}
                  style={{
                    padding:"16px 12px",
                    border:`1px solid ${context === c.id ? "rgba(201,168,76,0.6)" : "rgba(201,168,76,0.15)"}`,
                    background: context === c.id ? "rgba(201,168,76,0.06)" : "transparent",
                    cursor:"pointer", textAlign:"left",
                    transition:"all 0.3s",
                  }}>
                  <p style={{fontFamily:"'Cormorant Garamond',serif", fontSize:16, color:"#f5f0e8", marginBottom:4}}>{c.label}</p>
                  <p style={{fontSize:10, color:"#6a6258", lineHeight:1.5, letterSpacing:"0.03em"}}>{c.sub}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bouton enregistrement */}
        {(status === "idle" || status === "recording") && (
          <div style={{display:"flex", flexDirection:"column", alignItems:"center", gap:28, padding:"40px 0"}}>

            {blocked && status === "idle" ? (
              <div style={{
                width:"100%",
                background:"rgba(10,10,15,0.95)", backdropFilter:"blur(12px)",
                border:"1px solid rgba(201,168,76,0.3)",
                padding:"32px 28px",
                textAlign:"center",
              }}>
                <p className="ornament" style={{marginBottom:12}}>✦</p>
                <p style={{fontFamily:"'Cormorant Garamond',serif", fontSize:20, color:"#f5f0e8", marginBottom:8}}>
                  Quota mensuel atteint
                </p>
                <p style={{fontSize:12, color:"#6a6258", lineHeight:1.7, marginBottom:20}}>
                  Vous avez utilisé toutes vos analyses vocales ce mois-ci.<br/>
                  Passez à un forfait supérieur pour continuer.
                </p>
                <Link href="/pricing" className="btn-gold" style={{display:"inline-flex"}}>
                  <span className="btn-text">Voir les forfaits →</span>
                </Link>
              </div>
            ) : (
              <>
                {status === "recording" && (
                  <div style={{textAlign:"center"}}>
                    <div style={{
                      fontFamily:"'Cormorant Garamond',serif",
                      fontSize:64, fontWeight:300,
                      color:"#c9a84c", lineHeight:1,
                      letterSpacing:"0.05em",
                    }}>
                      {fmt(seconds)}
                    </div>
                    <div style={{display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginTop:8}}>
                      <div style={{width:6, height:6, borderRadius:"50%", background:"#c9a84c", animation:"pulseStep 1s ease-in-out infinite"}}/>
                      <span style={{fontSize:10, letterSpacing:"0.25em", textTransform:"uppercase", color:"#6a6258"}}>Enregistrement</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={status === "idle" ? startRec : stopRec}
                  style={{
                    width:96, height:96,
                    borderRadius:"50%",
                    border:`1px solid ${status === "recording" ? "rgba(201,168,76,0.6)" : "rgba(201,168,76,0.3)"}`,
                    background: status === "recording" ? "rgba(201,168,76,0.1)" : "transparent",
                    cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    transition:"all 0.4s",
                    animation: status === "recording" ? "pulseStep 2s ease-in-out infinite" : "none",
                  }}
                  onMouseEnter={e => { if (status === "idle") (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.7)" }}
                  onMouseLeave={e => { if (status === "idle") (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.3)" }}
                >
                  {status === "idle" ? (
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <rect x="10" y="2" width="8" height="14" rx="4" fill="#c9a84c"/>
                      <path d="M5 14 Q5 22 14 22 Q23 22 23 14" stroke="#c9a84c" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                      <line x1="14" y1="22" x2="14" y2="26" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round"/>
                      <line x1="8" y1="26" x2="20" y2="26" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <div style={{width:14, height:14, background:"#c9a84c"}}/>
                  )}
                </button>

                <p style={{fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:"#6a6258"}}>
                  {status === "idle" ? "Cliquez pour débuter" : "Cliquez pour terminer"}
                </p>
              </>
            )}
          </div>
        )}

        {/* Analyse en cours */}
        {status === "analyzing" && (
          <div style={{padding:"48px 0"}}>
            <div style={{marginBottom:32}}>
              <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:20}}>
                <div className="spinner-outline"/>
                <p style={{fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:300, color:"#f5f0e8"}}>Analyse en cours...</p>
              </div>
              <div className="progress-sweep"/>
            </div>

            <div style={{display:"flex", flexDirection:"column", gap:12}}>
              {STEPS.map((s, i) => (
                <div key={i} style={{display:"flex", alignItems:"center", gap:12}}>
                  <div style={{
                    width:7, height:7, borderRadius:"50%",
                    background: i < step ? "#c9a84c" : i === step ? "#c9a84c" : "rgba(201,168,76,0.15)",
                    animation: i === step ? "pulseStep 1s ease-in-out infinite" : "none",
                    transition:"background 0.4s",
                    flexShrink:0,
                  }}/>
                  <span style={{
                    fontSize:11, letterSpacing:"0.15em",
                    color: i <= step ? "#8a8070" : "#3a3830",
                    transition:"color 0.4s",
                  }}>{s}</span>
                  {i < step && <span style={{fontSize:10, color:"#c9a84c", marginLeft:"auto"}}>✓</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div style={{padding:"16px 20px", border:"1px solid rgba(255,100,100,0.2)", background:"rgba(255,100,100,0.04)", marginTop:24}}>
            <p style={{fontSize:12, color:"#ff8080", marginBottom:8}}>{error}</p>
            <button onClick={() => { setStatus("idle"); setError("") }}
              className="btn-ghost" style={{fontSize:10, padding:0, letterSpacing:"0.2em"}}>
              Réessayer
            </button>
          </div>
        )}

      </div>
    </main>
  )
}
