"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"

const CATS = ["Philosophie","Société & Politique","Technologie & IA","Environnement & Écologie","Éducation & Culture","Économie & Travail","Éthique & Bioéthique","Justice & Droit","Relations internationales","Identité & Société","Psychologie & Bien-être"]

export default function TrainingPage() {
  const [step,      setStep]      = useState("select")
  const [topics,    setTopics]    = useState<any[]>([])
  const [filtered,  setFiltered]  = useState<any[]>([])
  const [category,  setCategory]  = useState("Tous")
  const [search,    setSearch]    = useState("")
  const [selected,  setSelected]  = useState<any>(null)
  const [messages,  setMessages]  = useState<any[]>([])
  const [input,     setInput]     = useState("")
  const [loading,   setLoading]   = useState(false)
  const [debrief,   setDebrief]   = useState<any>(null)
  const [recording, setRecording] = useState(false)
  const mrRef = useRef<any>(null); const chunksRef = useRef<any[]>([]); const endRef = useRef<any>(null)

  useEffect(() => { fetch("/api/backend/training/topics").then(r=>r.json()).then(d=>{setTopics(d.topics||[]);setFiltered(d.topics||[])}) }, [])
  useEffect(() => { let f=topics; if(category!=="Tous") f=f.filter((t:any)=>t.category===category); if(search) f=f.filter((t:any)=>t.topic.toLowerCase().includes(search.toLowerCase())); setFiltered(f) }, [category,search,topics])
  useEffect(() => { endRef.current?.scrollIntoView({behavior:"smooth"}) }, [messages])

  const start = async (t: any) => {
    setSelected(t); setStep("chat"); setLoading(true)
    const res = await fetch("/api/backend/training/message", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({topic:t.topic, category:t.category, messages:[], user_input:"Je suis prêt à débattre de ce sujet."})
    })
    const data = await res.json()
    setMessages([{role:"assistant", content:data.response}])
    setLoading(false)
  }

  const send = async (text: string) => {
    if(!text.trim()||loading) return
    const msgs = [...messages, {role:"user", content:text}]
    setMessages(msgs); setInput(""); setLoading(true)
    const res = await fetch("/api/backend/training/message", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({topic:selected.topic, category:selected.category, messages:msgs, user_input:text})
    })
    const data = await res.json()
    setMessages(m=>[...m, {role:"assistant", content:data.response}])
    setLoading(false)
  }

  const end = async () => {
    setLoading(true)
    const res = await fetch("/api/backend/training/debrief", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({topic:selected.topic, category:selected.category, messages})
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
  const random = async () => { const r = await fetch("/api/backend/training/random"); start(await r.json()) }

  if (step==="select") return (
    <main style={{minHeight:"100vh", padding:"80px 48px", maxWidth:880, margin:"0 auto"}}>
      <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:48}}>
        <div>
          <div className="eyebrow" style={{marginBottom:16}}>Entraînement socratique</div>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(36px,5vw,56px)", fontWeight:300, lineHeight:1.1}}>
            {topics.length} sujets<br/><em style={{color:"#c9a84c"}}>d&apos;excellence</em>
          </h1>
        </div>
        <button onClick={random} className="btn-outline" style={{flexShrink:0, marginTop:8}}><span>Sujet aléatoire</span></button>
      </div>
      <div style={{height:1, background:"linear-gradient(90deg,transparent,rgba(201,168,76,0.3),transparent)", marginBottom:36}}/>
      <div style={{display:"flex", gap:8, flexWrap:"wrap", marginBottom:16}}>
        {["Tous",...CATS].map(c=>(
          <button key={c} onClick={()=>setCategory(c)} style={{
            fontFamily:"'Raleway',sans-serif", fontSize:9, letterSpacing:"0.2em", textTransform:"uppercase",
            padding:"6px 14px", border:`1px solid ${category===c?"rgba(201,168,76,0.5)":"rgba(201,168,76,0.12)"}`,
            background:category===c?"rgba(201,168,76,0.06)":"transparent", cursor:"pointer",
            color:category===c?"#c9a84c":"#6a6258", transition:"all 0.3s",
          }}>{c}</button>
        ))}
      </div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un sujet..."
        className="input-box" style={{marginBottom:20}}/>
      <div style={{maxHeight:"55vh", overflowY:"auto", display:"flex", flexDirection:"column", gap:2}}>
        {filtered.map((t,i) => (
          <button key={i} onClick={()=>start(t)} style={{
            textAlign:"left", padding:"16px 20px",
            border:"1px solid rgba(201,168,76,0.1)",
            background:"transparent", cursor:"pointer",
            transition:"all 0.3s",
          }}
          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(201,168,76,0.35)";(e.currentTarget as HTMLElement).style.background="rgba(201,168,76,0.02)"}}
          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(201,168,76,0.1)";(e.currentTarget as HTMLElement).style.background="transparent"}}>
            <p style={{fontSize:9, letterSpacing:"0.15em", textTransform:"uppercase", color:"#6a6258", marginBottom:4}}>{t.category}</p>
            <p style={{fontFamily:"'Cormorant Garamond',serif", fontSize:16, color:"#f5f0e8"}}>{t.topic}</p>
          </button>
        ))}
      </div>
    </main>
  )

  if (step==="chat") return (
    <main style={{minHeight:"100vh", display:"flex", flexDirection:"column"}}>
      <div style={{borderBottom:"1px solid rgba(201,168,76,0.15)", padding:"16px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(10,10,15,0.95)", backdropFilter:"blur(12px)", position:"sticky", top:64}}>
        <div>
          <p style={{fontSize:9, letterSpacing:"0.15em", textTransform:"uppercase", color:"#6a6258"}}>{selected?.category}</p>
          <p style={{fontFamily:"'Cormorant Garamond',serif", fontSize:18, color:"#f5f0e8"}}>{selected?.topic}</p>
        </div>
        <button onClick={end} disabled={loading||messages.length<2} className="btn-outline" style={{fontSize:10, padding:"10px 24px"}}>Bilan →</button>
      </div>
      <div style={{flex:1, overflowY:"auto", padding:"32px", display:"flex", flexDirection:"column", gap:20}}>
        {messages.map((m,i)=>(
          <div key={i} style={{display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            <div style={{maxWidth:"62%", padding:"16px 20px", border:`1px solid ${m.role==="user"?"rgba(201,168,76,0.4)":"rgba(201,168,76,0.1)"}`, background:m.role==="user"?"rgba(201,168,76,0.06)":"rgba(18,17,26,0.8)"}}>
              {m.role==="assistant"&&<p style={{fontSize:9, letterSpacing:"0.2em", textTransform:"uppercase", color:"#c9a84c", marginBottom:8}}>Socrate</p>}
              <p style={{fontFamily:"'Libre Baskerville',serif", fontSize:13, lineHeight:1.85, color:m.role==="user"?"#f5f0e8":"#ede8dc", fontStyle:m.role==="assistant"?"italic":"normal"}}>{m.content}</p>
            </div>
          </div>
        ))}
        {loading&&<div style={{display:"flex", justifyContent:"flex-start"}}><div style={{padding:"16px 20px", border:"1px solid rgba(201,168,76,0.1)", display:"flex", gap:6}}>{[0,200,400].map(d=><div key={d} style={{width:4,height:4,borderRadius:"50%",background:"rgba(201,168,76,0.4)",animation:`pulseStep 1.2s ${d}ms ease-in-out infinite`}}/>)}</div></div>}
        <div ref={endRef}/>
      </div>
      <div style={{borderTop:"1px solid rgba(201,168,76,0.15)", padding:"16px 32px", display:"flex", gap:12, background:"rgba(10,10,15,0.95)"}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send(input)}
          placeholder="Défendez votre position..." disabled={loading} className="input-box" style={{flex:1}}/>
        <button onClick={recording?stopVoice:startVoice} style={{width:44,height:44,border:`1px solid ${recording?"#c9a84c":"rgba(201,168,76,0.3)"}`,background:recording?"rgba(201,168,76,0.1)":"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="5.5" y="1" width="5" height="8" rx="2.5" fill="#c9a84c"/><path d="M2 8 Q2 13 8 13 Q14 13 14 8" stroke="#c9a84c" strokeWidth="1.2" fill="none" strokeLinecap="round"/><line x1="8" y1="13" x2="8" y2="15" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round"/></svg>
        </button>
        <button onClick={()=>send(input)} disabled={!input.trim()||loading} className="btn-gold" style={{padding:"0 24px",height:44}}><span className="btn-text">→</span></button>
      </div>
      <style>{`@keyframes pulseStep{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </main>
  )

  if (step==="debrief"&&debrief) return (
    <main style={{minHeight:"100vh", padding:"80px 48px", maxWidth:760, margin:"0 auto"}}>
      <div style={{marginBottom:40}}>
        <div className="eyebrow" style={{marginBottom:16}}>Bilan d&apos;entraînement</div>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(28px,4vw,44px)", fontWeight:300, lineHeight:1.2}}>{selected?.topic}</h1>
      </div>
      <div style={{height:1,background:"linear-gradient(90deg,transparent,rgba(201,168,76,0.3),transparent)",marginBottom:36}}/>
      <div style={{border:"1px solid rgba(201,168,76,0.2)",padding:"40px",textAlign:"center",marginBottom:24,position:"relative"}}>
        <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:60,height:1,background:"#c9a84c"}}/>
        <p style={{fontFamily:"'Raleway',sans-serif",fontSize:10,letterSpacing:"0.3em",textTransform:"uppercase",color:"#6a6258",marginBottom:12}}>Note globale</p>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:80,fontWeight:300,color:"#c9a84c",lineHeight:1}}>{debrief.note_globale}<span style={{fontSize:24,color:"rgba(201,168,76,0.4)"}}>/10</span></div>
        <p style={{fontSize:13,color:"#6a6258",marginTop:14,lineHeight:1.9,maxWidth:440,margin:"14px auto 0"}}>{debrief.resume}</p>
      </div>
      {debrief.meilleur_argument&&<div style={{borderLeft:"2px solid #c9a84c",paddingLeft:24,marginBottom:24}}>
        <p style={{fontFamily:"'Raleway',sans-serif",fontSize:10,letterSpacing:"0.25em",textTransform:"uppercase",color:"#c9a84c",marginBottom:10}}>Votre meilleur argument</p>
        <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,fontStyle:"italic",color:"#f5f0e8",lineHeight:1.7}}>&ldquo;{debrief.meilleur_argument}&rdquo;</p>
      </div>}
      {debrief.philosophes_a_lire?.length>0&&<div style={{border:"1px solid rgba(201,168,76,0.12)",padding:"20px 24px",marginBottom:24}}>
        <p style={{fontFamily:"'Raleway',sans-serif",fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:"#6a6258",marginBottom:14}}>Philosophes à lire sur ce sujet</p>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{debrief.philosophes_a_lire.map((p:string,i:number)=><span key={i} style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,border:"1px solid rgba(201,168,76,0.2)",padding:"4px 14px",color:"#8a8070"}}>{p}</span>)}</div>
      </div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:32}}>
        {[["Points forts",debrief.points_forts,"#c9a84c"],["À améliorer",debrief.axes_amelioration,"#8a8070"]].map(([t,items,c]:any)=>(
          <div key={t} style={{border:"1px solid rgba(201,168,76,0.12)",padding:"20px 24px"}}>
            <p style={{fontFamily:"'Raleway',sans-serif",fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:c,marginBottom:14}}>{t}</p>
            {(items||[]).map((p:string,i:number)=><p key={i} style={{fontSize:12,color:"#6a6258",marginBottom:8,lineHeight:1.7,paddingLeft:12,position:"relative"}}><span style={{position:"absolute",left:0,color:c}}>&rsaquo;</span>{p}</p>)}
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:16}}>
        <button onClick={()=>{setStep("select");setMessages([]);setDebrief(null);setSelected(null)}} className="btn-outline" style={{flex:1,justifyContent:"center"}}><span>Nouveau sujet</span></button>
        <Link href="/speech-analysis" className="btn-gold" style={{flex:1,justifyContent:"center"}}><span className="btn-text">Analyser un discours</span></Link>
      </div>
    </main>
  )
  return null
}
