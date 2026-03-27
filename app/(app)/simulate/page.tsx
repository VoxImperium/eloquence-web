"use client"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { getPlanLimits, fetchUsage, trackUsage } from "@/lib/plan-limits"
import { isAdminEmail } from "@/lib/admin"
import Link from "next/link"

const SCENARIOS = [
  { id:"pitch_investisseur",   label:"Pitch investisseur",    sub:"Marc Dubois, VC senior — questions difficiles sur le modèle économique",   num:"I"   },
  { id:"entretien_embauche",   label:"Entretien d'embauche",  sub:"Sophie Martin, DRH cabinet conseil — questions STAR comportementales",      num:"II"  },
  { id:"debat_contradictoire", label:"Débat contradictoire",  sub:"Thomas Laurent — prend systématiquement la position opposée",               num:"III" },
  { id:"reunion_client",       label:"Réunion client",        sub:"Isabelle Morel, directrice grands comptes — objections prix et délais",     num:"IV"  },
  { id:"plaidoirie",           label:"Plaidoirie",            sub:"Président du jury d'éloquence — teste la solidité des arguments",           num:"V"   },
]

export default function SimulatePage() {
  const [step,      setStep]      = useState("select")
  const [scenario,  setScenario]  = useState<any>(null)
  const [topic,     setTopic]     = useState("")
  const [messages,  setMessages]  = useState<any[]>([])
  const [input,     setInput]     = useState("")
  const [loading,   setLoading]   = useState(false)
  const [debrief,   setDebrief]   = useState<any>(null)
  const [recording, setRecording] = useState(false)
  const [userId,    setUserId]    = useState<string|null>(null)
  const [plan,      setPlan]      = useState<string|null>(null)
  const [used,      setUsed]      = useState(0)
  const [isAdmin,   setIsAdmin]   = useState(false)

  const mrRef     = useRef<any>(null)
  const chunksRef = useRef<any[]>([])
  const endRef    = useRef<any>(null)
  const router    = useRouter()
  const supabase  = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login?redirect=/simulate"); return }
      setUserId(user.id)
      setIsAdmin(isAdminEmail(user.email))
      fetchUsage("simulations").then(setUsed)
      supabase.from("profiles").select("plan").eq("id", user.id).single()
        .then(({ data }) => setPlan(data?.plan ?? null))
    })
  }, [])

  useEffect(() => { endRef.current?.scrollIntoView({behavior:"smooth"}) }, [messages])

  const startChat = async () => {
    setStep("chat"); setLoading(true)
    const res = await fetch("/api/backend/simulate/message", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({scenario:scenario.id, messages:[], user_input:`Bonjour, je suis prêt. ${topic ? "Sujet : "+topic : ""}`, topic})
    })
    const data = await res.json()
    if (userId) trackUsage("simulations").then(setUsed).catch(() => {})
    setMessages([{role:"assistant", content:data.response, name:data.persona_name}])
    setLoading(false)
  }

  const send = async (text: string) => {
    if (!text.trim() || loading) return
    const msgs = [...messages, {role:"user", content:text}]
    setMessages(msgs); setInput(""); setLoading(true)
    const res = await fetch("/api/backend/simulate/message", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({scenario:scenario.id, messages:msgs, user_input:text, topic})
    })
    const data = await res.json()
    setMessages(m => [...m, {role:"assistant", content:data.response, name:data.persona_name}])
    setLoading(false)
  }

  const endSim = async () => {
    setLoading(true)
    const res = await fetch("/api/backend/simulate/debrief", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({scenario:scenario.id, messages, topic})
    })
    setDebrief(await res.json()); setStep("debrief"); setLoading(false)
  }

  const startVoice = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio:true})
      chunksRef.current = []
      const mr = new MediaRecorder(stream, {mimeType:"audio/webm"})
      mr.ondataavailable = e => { if(e.data.size>0) chunksRef.current.push(e.data) }
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, {type:"audio/webm"})
        const form = new FormData(); form.append("audio",blob,"v.webm"); form.append("context","general")
        const res = await fetch("/api/backend/analyze", {method:"POST",body:form})
        const data = await res.json()
        if(data.transcript) await send(data.transcript)
      }
      mr.start(); mrRef.current = mr; setRecording(true)
    } catch { alert("Microphone inaccessible") }
  }

  const stopVoice = () => { mrRef.current?.stop(); mrRef.current?.stream.getTracks().forEach((t:any)=>t.stop()); setRecording(false) }

  const S = scenario ? SCENARIOS.find(s=>s.id===scenario.id) : null
  const limits   = getPlanLimits(plan)
  const simLimit = limits.simulations
  const quotaMax = simLimit === Infinity ? null : simLimit
  const blocked  = !isAdmin && quotaMax !== null && used >= quotaMax

  // SÉLECTION
  if (step==="select") return (
    <main style={{minHeight:"100vh", padding:"80px 48px", maxWidth:800, margin:"0 auto"}}>
      <div style={{marginBottom:48}}>
        <Link href="/" style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:"#6a6258", textDecoration:"none"}}>← Retour</Link>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:20, marginBottom:16}}>
          <div className="eyebrow" style={{marginBottom:0}}>Joute verbale</div>
          {quotaMax !== null && (
            <span style={{
              fontSize:10, letterSpacing:"0.1em", color: blocked ? "#c97a4c" : "#6a6258",
              border:`1px solid ${blocked ? "rgba(201,120,76,0.3)" : "rgba(201,168,76,0.15)"}`,
              padding:"3px 10px",
            }}>
              {used} / {quotaMax} joutes verbales ce mois
            </span>
          )}
        </div>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(36px,5vw,56px)", fontWeight:300, lineHeight:1.1}}>
          Choisissez votre <em style={{color:"#c9a84c"}}>épreuve</em>
        </h1>
      </div>
      <div style={{height:1, background:"linear-gradient(90deg,transparent,rgba(201,168,76,0.3),transparent)", marginBottom:40}}/>
      {blocked ? (
        <div style={{
          background:"rgba(10,10,15,0.95)", backdropFilter:"blur(12px)",
          border:"1px solid rgba(201,168,76,0.3)",
          padding:"48px 36px",
          textAlign:"center",
        }}>
          <p className="ornament" style={{marginBottom:12}}>✦</p>
          <p style={{fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:"#f5f0e8", marginBottom:8}}>
            Quota mensuel atteint
          </p>
          <p style={{fontSize:12, color:"#6a6258", lineHeight:1.7, marginBottom:20}}>
            Vous avez utilisé toutes vos joutes verbales ce mois-ci.<br/>
            Passez à un forfait supérieur pour continuer.
          </p>
          <Link href="/pricing" className="btn-gold" style={{display:"inline-flex"}}>
            <span className="btn-text">Voir les forfaits →</span>
          </Link>
        </div>
      ) : (
        <>
          <div style={{display:"flex", flexDirection:"column", gap:2}}>
            {SCENARIOS.map(s => (
              <button key={s.id} onClick={() => setScenario(s)}
                style={{
                  display:"flex", alignItems:"center", gap:24,
                  padding:"24px 28px",
                  border:`1px solid ${scenario?.id===s.id ? "rgba(201,168,76,0.5)" : "rgba(201,168,76,0.12)"}`,
                  background: scenario?.id===s.id ? "rgba(201,168,76,0.04)" : "transparent",
                  cursor:"pointer", textAlign:"left",
                  transition:"all 0.3s",
                }}
                onMouseEnter={e => { if(scenario?.id!==s.id) { (e.currentTarget as HTMLElement).style.borderColor="rgba(201,168,76,0.3)" }}}
                onMouseLeave={e => { if(scenario?.id!==s.id) { (e.currentTarget as HTMLElement).style.borderColor="rgba(201,168,76,0.12)" }}}>
                <span style={{fontFamily:"'Cormorant Garamond',serif", fontSize:24, fontWeight:300, color:"rgba(201,168,76,0.3)", width:32, flexShrink:0}}>{s.num}</span>
                <div>
                  <p style={{fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:400, color:"#f5f0e8", marginBottom:4}}>{s.label}</p>
                  <p style={{fontSize:11, color:"#6a6258", lineHeight:1.6, letterSpacing:"0.02em"}}>{s.sub}</p>
                </div>
              </button>
            ))}
          </div>
          <div style={{marginTop:32}}>
            <button onClick={() => scenario && setStep("topic")} disabled={!scenario} className="btn-gold" style={{width:"100%", justifyContent:"center"}}>
              <span className="btn-text">Continuer →</span>
            </button>
          </div>
        </>
      )}
    </main>
  )

  // SUJET
  if (step==="topic") return (
    <main style={{minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"80px 48px"}}>
      <div style={{width:"100%", maxWidth:520}}>
        <button onClick={() => setStep("select")} style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:"#6a6258", background:"none", border:"none", cursor:"pointer", marginBottom:32}}>← Retour</button>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif", fontSize:40, fontWeight:300, marginBottom:8}}>{S?.label}</h1>
        <p style={{fontSize:12, color:"#6a6258", marginBottom:40}}>{S?.sub}</p>
        <div style={{height:1, background:"rgba(201,168,76,0.15)", marginBottom:36}}/>
        <label className="label-oratoire">Sujet ou contexte précis (optionnel)</label>
        <input value={topic} onChange={e=>setTopic(e.target.value)}
          placeholder="Ex : Startup SaaS B2B, levée de fonds série A..."
          className="input-oratoire" style={{marginBottom:32, display:"block"}}
          onKeyDown={e=>e.key==="Enter"&&startChat()}/>
        <button onClick={startChat} className="btn-gold" style={{width:"100%", justifyContent:"center"}}>
          <span className="btn-text">Démarrer la joute verbale →</span>
        </button>
      </div>
    </main>
  )

  // CHAT
  if (step==="chat") return (
    <main style={{minHeight:"100vh", display:"flex", flexDirection:"column"}}>
      <div style={{borderBottom:"1px solid rgba(201,168,76,0.15)", padding:"16px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(10,10,15,0.95)", backdropFilter:"blur(12px)", position:"sticky", top:64}}>
        <div>
          <p style={{fontFamily:"'Cormorant Garamond',serif", fontSize:18, color:"#f5f0e8"}}>{S?.label}</p>
          <p style={{fontSize:10, color:"#6a6258", letterSpacing:"0.1em"}}>{topic || "Sujet libre"}</p>
        </div>
        <button onClick={endSim} disabled={loading||messages.length<2} className="btn-outline" style={{fontSize:10, padding:"10px 24px"}}>
          Terminer & Bilan
        </button>
      </div>
      <div style={{flex:1, overflowY:"auto", padding:"32px", display:"flex", flexDirection:"column", gap:20}}>
        {messages.map((m, i) => (
          <div key={i} style={{display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            <div style={{
              maxWidth:"60%", padding:"16px 20px",
              border:`1px solid ${m.role==="user"?"rgba(201,168,76,0.4)":"rgba(201,168,76,0.1)"}`,
              background: m.role==="user"?"rgba(201,168,76,0.06)":"rgba(18,17,26,0.8)",
            }}>
              {m.role==="assistant"&&<p style={{fontSize:9, letterSpacing:"0.2em", textTransform:"uppercase", color:"#6a6258", marginBottom:8}}>{m.name}</p>}
              <p style={{fontFamily:"'Libre Baskerville',serif", fontSize:13, lineHeight:1.8, color:m.role==="user"?"#f5f0e8":"#ede8dc"}}>{m.content}</p>
            </div>
          </div>
        ))}
        {loading&&<div style={{display:"flex", justifyContent:"flex-start"}}><div style={{padding:"16px 20px", border:"1px solid rgba(201,168,76,0.1)", display:"flex", gap:6, alignItems:"center"}}>{[0,200,400].map(d=><div key={d} style={{width:4,height:4,borderRadius:"50%",background:"rgba(201,168,76,0.4)",animation:`pulseStep 1.2s ease-in-out ${d}ms infinite`}}/>)}</div></div>}
        <div ref={endRef}/>
      </div>
      <div style={{borderTop:"1px solid rgba(201,168,76,0.15)", padding:"16px 32px", display:"flex", gap:12, background:"rgba(10,10,15,0.95)"}}>
        <input value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send(input)}
          placeholder="Votre réponse..." disabled={loading}
          className="input-box" style={{flex:1, resize:"none"}}/>
        <button onClick={recording?stopVoice:startVoice} style={{
          width:44, height:44, border:`1px solid ${recording?"#c9a84c":"rgba(201,168,76,0.3)"}`,
          background:recording?"rgba(201,168,76,0.1)":"transparent", cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
          animation:recording?"pulseStep 2s ease-in-out infinite":"none",
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="5.5" y="1" width="5" height="8" rx="2.5" fill="#c9a84c"/>
            <path d="M2 8 Q2 13 8 13 Q14 13 14 8" stroke="#c9a84c" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
            <line x1="8" y1="13" x2="8" y2="15" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </button>
        <button onClick={()=>send(input)} disabled={!input.trim()||loading} className="btn-gold" style={{padding:"0 24px", height:44}}>
          <span className="btn-text">→</span>
        </button>
      </div>
      <style>{`@keyframes pulseStep{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </main>
  )

  // DEBRIEF
  if (step==="debrief"&&debrief) return (
    <main style={{minHeight:"100vh", padding:"80px 48px", maxWidth:760, margin:"0 auto"}}>
      <div style={{marginBottom:40}}>
        <div className="eyebrow" style={{marginBottom:16}}>Bilan de joute verbale</div>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(32px,4vw,48px)", fontWeight:300}}>{S?.label}</h1>
      </div>
      <div style={{height:1, background:"linear-gradient(90deg,transparent,rgba(201,168,76,0.3),transparent)", marginBottom:40}}/>
      <div style={{border:"1px solid rgba(201,168,76,0.2)", padding:"48px", textAlign:"center", marginBottom:24, position:"relative"}}>
        <div style={{position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:60, height:1, background:"#c9a84c"}}/>
        <p style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.3em", textTransform:"uppercase", color:"#6a6258", marginBottom:12}}>Note globale</p>
        <div style={{fontFamily:"'Cormorant Garamond',serif", fontSize:88, fontWeight:300, color:"#c9a84c", lineHeight:1}}>{debrief.note_globale}<span style={{fontSize:28, color:"rgba(201,168,76,0.4)"}}>/10</span></div>
        <p style={{fontSize:13, color:"#6a6258", marginTop:16, lineHeight:1.9, maxWidth:480, margin:"16px auto 0"}}>{debrief.resume}</p>
      </div>
      {debrief.meilleure_replique&&<div style={{borderLeft:"2px solid #c9a84c", paddingLeft:24, marginBottom:24}}>
        <p style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.25em", textTransform:"uppercase", color:"#c9a84c", marginBottom:10}}>Votre meilleure réplique</p>
        <p style={{fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontStyle:"italic", color:"#f5f0e8", lineHeight:1.7}}>&ldquo;{debrief.meilleure_replique}&rdquo;</p>
      </div>}
      <div style={{border:"1px solid rgba(201,168,76,0.15)", padding:"24px 28px", marginBottom:24}}>
        <p style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.25em", textTransform:"uppercase", color:"#6a6258", marginBottom:16}}>Conseil principal</p>
        <p style={{fontSize:13, color:"#ede8dc", lineHeight:1.8}}>{debrief.conseil_principal}</p>
      </div>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:32}}>
        {[["Points forts",debrief.points_forts,"#c9a84c"],["À améliorer",debrief.points_faibles,"#8a8070"]].map(([t,items,c]:any)=>(
          <div key={t} style={{border:"1px solid rgba(201,168,76,0.12)", padding:"20px 24px"}}>
            <p style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:c, marginBottom:14}}>{t}</p>
            {(items||[]).map((p:string,i:number)=><p key={i} style={{fontSize:12, color:"#6a6258", marginBottom:8, lineHeight:1.7, paddingLeft:12, position:"relative"}}><span style={{position:"absolute",left:0,color:c}}>&rsaquo;</span>{p}</p>)}
          </div>
        ))}
      </div>
      <div style={{display:"flex", gap:16}}>
        <button onClick={()=>{setStep("select");setMessages([]);setDebrief(null);setScenario(null)}} className="btn-outline" style={{flex:1, justifyContent:"center"}}><span>Nouvelle joute verbale</span></button>
        <Link href="/legifrance" className="btn-outline" style={{flex:1,justifyContent:"center"}}><span>Plaider un cas</span></Link>
        <Link href="/record" className="btn-gold" style={{flex:1, justifyContent:"center"}}><span className="btn-text">Analyser un discours</span></Link>
      </div>
    </main>
  )
  return null
}
