"use client"
import { useState, useRef } from "react"
import Link from "next/link"

const CONTEXTS = [
  {id:"general",      label:"Général"},
  {id:"politique",    label:"Discours politique"},
  {id:"judiciaire",   label:"Plaidoirie"},
  {id:"academique",   label:"Exposé académique"},
  {id:"professionnel",label:"Présentation pro"},
]

export default function SpeechAnalysisPage() {
  const [mode,      setMode]      = useState("text")
  const [text,      setText]      = useState("")
  const [context,   setContext]   = useState("general")
  const [loading,   setLoading]   = useState(false)
  const [result,    setResult]    = useState<any>(null)
  const [recording, setRecording] = useState(false)
  const [tab,       setTab]       = useState("analyse")
  const [step,      setStep]      = useState(0)
  const mrRef = useRef<any>(null); const chunksRef = useRef<any[]>([])

  const STEPS = ["Lecture du discours","Analyse rhétorique","Identification des figures","Réécriture oratoire"]

  const analyze = async () => {
    setLoading(true); setResult(null); setStep(0)
    const iv = setInterval(()=>setStep(s=>s<STEPS.length-1?s+1:s), 8000)
    try {
      const res = await fetch("/api/backend/speech/analyze-text", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({text, context})
      })
      setResult(await res.json()); setTab("analyse")
    } catch { alert("Erreur lors de l'analyse") }
    clearInterval(iv); setLoading(false)
  }

  const startVoice = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio:true})
      chunksRef.current = []
      const mr = new MediaRecorder(stream, {mimeType:"audio/webm"})
      mr.ondataavailable = e => { if(e.data.size>0) chunksRef.current.push(e.data) }
      mr.onstop = async () => {
        setLoading(true); setResult(null); setStep(0)
        const blob = new Blob(chunksRef.current, {type:"audio/webm"})
        const form = new FormData(); form.append("audio",blob,"s.webm"); form.append("context",context)
        const res = await fetch("/api/backend/speech/analyze-audio", {method:"POST",body:form})
        const data = await res.json()
        if(data.transcript) setText(data.transcript)
        setResult(data); setTab("analyse"); setLoading(false)
      }
      mr.start(); mrRef.current = mr; setRecording(true)
    } catch { alert("Microphone inaccessible") }
  }
  const stopVoice = () => { mrRef.current?.stop(); mrRef.current?.stream.getTracks().forEach((t:any)=>t.stop()); setRecording(false) }

  const A = result?.analyse_globale
  const scoreColor = (n:number) => n>=7?"#c9a84c":n>=5?"#8a8070":"#6a5a50"

  return (
    <main style={{minHeight:"100vh", padding:"80px 48px", maxWidth:900, margin:"0 auto"}}>

      <div style={{marginBottom:48}}>
        <Link href="/" style={{fontFamily:"'Raleway',sans-serif",fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:"#6a6258",textDecoration:"none"}}>← Retour</Link>
        <div className="eyebrow" style={{marginTop:20,marginBottom:16}}>Réécriture oratoire</div>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(36px,5vw,56px)",fontWeight:300,lineHeight:1.1}}>
          Sublimez votre <em style={{color:"#c9a84c"}}>discours</em>
        </h1>
        <p style={{fontSize:13,color:"#6a6258",marginTop:12,lineHeight:1.9,maxWidth:520}}>Déposez votre texte ou enregistrez votre voix. L&apos;IA l&apos;analyse et le réécrit selon les codes de l&apos;art oratoire classique.</p>
      </div>

      <div style={{height:1,background:"linear-gradient(90deg,transparent,rgba(201,168,76,0.3),transparent)",marginBottom:40}}/>

      {/* Mode */}
      <div style={{display:"flex",gap:4,marginBottom:24}}>
        {[["text","Texte"],["audio","Enregistrement vocal"]].map(([m,l])=>(
          <button key={m} onClick={()=>setMode(m)} style={{
            fontFamily:"'Raleway',sans-serif",fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",
            padding:"10px 24px",border:`1px solid ${mode===m?"rgba(201,168,76,0.5)":"rgba(201,168,76,0.15)"}`,
            background:mode===m?"rgba(201,168,76,0.05)":"transparent",cursor:"pointer",
            color:mode===m?"#c9a84c":"#6a6258",transition:"all 0.3s",
          }}>{l}</button>
        ))}
      </div>

      {/* Contexte */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:24}}>
        {CONTEXTS.map(c=>(
          <button key={c.id} onClick={()=>setContext(c.id)} style={{
            fontFamily:"'Raleway',sans-serif",fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",
            padding:"6px 14px",border:`1px solid ${context===c.id?"rgba(201,168,76,0.5)":"rgba(201,168,76,0.12)"}`,
            background:context===c.id?"rgba(201,168,76,0.05)":"transparent",cursor:"pointer",
            color:context===c.id?"#c9a84c":"#6a6258",transition:"all 0.3s",
          }}>{c.label}</button>
        ))}
      </div>

      {/* Input */}
      {mode==="text"&&(
        <div style={{marginBottom:20}}>
          <textarea value={text} onChange={e=>setText(e.target.value)}
            placeholder="Collez votre discours ici — minimum 3 phrases pour une analyse pertinente..."
            className="input-box" rows={10} style={{marginBottom:16}}/>
          <button onClick={analyze} disabled={!text.trim()||loading} className="btn-gold" style={{width:"100%",justifyContent:"center"}}>
            {loading?(
              <><span className="spinner-gold"/><span className="btn-text">Analyse en cours...</span></>
            ):<span className="btn-text">Analyser et réécrire mon discours →</span>}
          </button>
        </div>
      )}

      {mode==="audio"&&(
        <div style={{border:"1px solid rgba(201,168,76,0.15)",padding:"48px",textAlign:"center",marginBottom:20}}>
          <button onClick={recording?stopVoice:startVoice} style={{
            width:80,height:80,borderRadius:"50%",
            border:`1px solid ${recording?"rgba(201,168,76,0.6)":"rgba(201,168,76,0.3)"}`,
            background:recording?"rgba(201,168,76,0.08)":"transparent",cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",
            animation:recording?"pulseAnim 2s ease-in-out infinite":"none",
          }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="10" y="2" width="8" height="14" rx="4" fill="#c9a84c"/>
              <path d="M5 14 Q5 22 14 22 Q23 22 23 14" stroke="#c9a84c" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              <line x1="14" y1="22" x2="14" y2="26" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="8" y1="26" x2="20" y2="26" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <p style={{fontFamily:"'Raleway',sans-serif",fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:"#6a6258"}}>{loading?"Transcription et analyse en cours...":recording?"Parlez — cliquez pour terminer":"Cliquez pour enregistrer"}</p>
          {text&&<p style={{fontSize:12,color:"#6a6258",marginTop:16,fontStyle:"italic"}}>&ldquo;{text.slice(0,80)}...&rdquo;</p>}
        </div>
      )}

      {/* Loading steps */}
      {loading&&(
        <div style={{border:"1px solid rgba(201,168,76,0.12)",padding:"24px 28px",marginBottom:24}}>
          <div className="progress-sweep" style={{marginBottom:20}}/>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {STEPS.map((s,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:i<=step?"#c9a84c":"rgba(201,168,76,0.15)",animation:i===step?"pulseStep 1s ease-in-out infinite":"none",transition:"background 0.4s",flexShrink:0}}/>
                <span style={{fontSize:11,letterSpacing:"0.1em",color:i<=step?"#8a8070":"#3a3830",transition:"color 0.4s"}}>{s}</span>
                {i<step&&<span style={{fontSize:10,color:"#c9a84c",marginLeft:"auto"}}>✓</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Résultats */}
      {result&&A&&(
        <div style={{marginTop:40}}>
          {/* Scores */}
          <div style={{border:"1px solid rgba(201,168,76,0.2)",padding:"32px 36px",marginBottom:24,position:"relative"}}>
            <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:60,height:1,background:"#c9a84c"}}/>
            <p style={{fontFamily:"'Raleway',sans-serif",fontSize:10,letterSpacing:"0.3em",textTransform:"uppercase",color:"#6a6258",marginBottom:24}}>Évaluation rhétorique</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:20,marginBottom:24}}>
              {[["Structure",A.note_structure],["Style",A.note_style],["Persuasion",A.note_persuasion],["Rythme",A.note_rythme]].map(([l,v]:any)=>(
                <div key={l} style={{borderTop:"1px solid rgba(201,168,76,0.12)",paddingTop:14}}>
                  <p style={{fontFamily:"'Raleway',sans-serif",fontSize:9,letterSpacing:"0.2em",textTransform:"uppercase",color:"#6a6258",marginBottom:6}}>{l}</p>
                  <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:300,color:scoreColor(v)}}>{v}<span style={{fontSize:12,color:"rgba(201,168,76,0.3)"}}>/10</span></p>
                </div>
              ))}
            </div>
            <p style={{fontSize:13,color:"#6a6258",lineHeight:1.9,fontStyle:"italic"}}>{A.resume_critique}</p>
          </div>

          {/* Tabs */}
          <div style={{display:"flex",borderBottom:"1px solid rgba(201,168,76,0.15)",marginBottom:28}}>
            {[["analyse","Analyse"],["rewrite","Version réécrite"],["annotations","Annotations"]].map(([t,l])=>(
              <button key={t} onClick={()=>setTab(t)} style={{
                fontFamily:"'Raleway',sans-serif",fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",
                padding:"12px 24px",border:"none",background:"transparent",cursor:"pointer",
                color:tab===t?"#c9a84c":"#6a6258",
                borderBottom:tab===t?"1px solid #c9a84c":"1px solid transparent",
                transition:"all 0.3s",marginBottom:-1,
              }}>{l}</button>
            ))}
          </div>

          {tab==="analyse"&&(
            <div style={{display:"flex",flexDirection:"column",gap:20}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                {[["Points forts",result.points_forts,"#c9a84c"],["Faiblesses",result.faiblesses,"#8a8070"]].map(([t,items,c]:any)=>(
                  <div key={t} style={{border:"1px solid rgba(201,168,76,0.12)",padding:"20px 24px"}}>
                    <p style={{fontFamily:"'Raleway',sans-serif",fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:c,marginBottom:14}}>{t}</p>
                    {(items||[]).map((p:string,i:number)=><p key={i} style={{fontSize:12,color:"#6a6258",marginBottom:8,lineHeight:1.7,paddingLeft:12,position:"relative"}}><span style={{position:"absolute",left:0,color:c}}>&rsaquo;</span>{p}</p>)}
                  </div>
                ))}
              </div>
              {A.figures_utilisees?.length>0&&(
                <div style={{border:"1px solid rgba(201,168,76,0.12)",padding:"20px 24px"}}>
                  <p style={{fontFamily:"'Raleway',sans-serif",fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:"#6a6258",marginBottom:16}}>Figures de style détectées</p>
                  <div style={{display:"flex",flexDirection:"column",gap:12}}>
                    {A.figures_utilisees.map((f:any,i:number)=>(
                      <div key={i} style={{borderLeft:"1px solid rgba(201,168,76,0.2)",paddingLeft:16}}>
                        <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,color:"#c9a84c",marginBottom:4}}>{f.figure}</p>
                        <p style={{fontSize:11,color:"#6a6258",fontStyle:"italic",marginBottom:2}}>&ldquo;{f.extrait}&rdquo;</p>
                        <p style={{fontSize:11,color:"#6a6258"}}>{f.effet}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {result.orateurs_reference?.length>0&&(
                <div style={{border:"1px solid rgba(201,168,76,0.12)",padding:"20px 24px"}}>
                  <p style={{fontFamily:"'Raleway',sans-serif",fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:"#6a6258",marginBottom:14}}>Orateurs de référence</p>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{result.orateurs_reference.map((o:string,i:number)=><span key={i} style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,border:"1px solid rgba(201,168,76,0.2)",padding:"4px 16px",color:"#8a8070"}}>{o}</span>)}</div>
                </div>
              )}
            </div>
          )}

          {tab==="rewrite"&&(
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              {result.structure&&(
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                  {[["Exorde",result.structure.exorde],["Narration",result.structure.narration],["Développement",result.structure.developpement],["Péroraison",result.structure.peroraison]].map(([l,v]:any)=>(
                    <div key={l} style={{border:"1px solid rgba(201,168,76,0.12)",padding:"14px 16px"}}>
                      <p style={{fontFamily:"'Raleway',sans-serif",fontSize:9,letterSpacing:"0.2em",textTransform:"uppercase",color:"#c9a84c",marginBottom:6}}>{l}</p>
                      <p style={{fontSize:11,color:"#6a6258",lineHeight:1.6}}>{v}</p>
                    </div>
                  ))}
                </div>
              )}
              <div style={{border:"1px solid rgba(201,168,76,0.15)",padding:"32px",background:"rgba(12,11,18,0.6)"}}>
                <p style={{fontFamily:"'Raleway',sans-serif",fontSize:9,letterSpacing:"0.25em",textTransform:"uppercase",color:"#6a6258",marginBottom:20}}>Discours réécrit selon l&apos;art oratoire</p>
                <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:14,lineHeight:2,color:"#ede8dc",whiteSpace:"pre-wrap", textAlign:"justify"}}>{result.version_amelioree}</div>
              </div>
              {result.modifications?.length>0&&(
                <div style={{border:"1px solid rgba(201,168,76,0.12)",padding:"20px 24px"}}>
                  <p style={{fontFamily:"'Raleway',sans-serif",fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:"#6a6258",marginBottom:14}}>Modifications apportées</p>
                  {result.modifications.map((m:string,i:number)=><p key={i} style={{fontSize:12,color:"#6a6258",marginBottom:8,lineHeight:1.7,paddingLeft:12,position:"relative"}}><span style={{position:"absolute",left:0,color:"rgba(201,168,76,0.5)"}}>&rsaquo;</span>{m}</p>)}
                </div>
              )}
              <button onClick={()=>navigator.clipboard.writeText(result.version_amelioree)} className="btn-outline" style={{width:"100%",justifyContent:"center"}}><span>Copier le discours réécrit</span></button>
            </div>
          )}

          {tab==="annotations"&&(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {(result.annotations||[]).map((a:any,i:number)=>(
                <div key={i} style={{border:"1px solid rgba(201,168,76,0.12)",padding:"20px 24px"}}>
                  <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:10}}>
                    <span style={{fontFamily:"'Raleway',sans-serif",fontSize:9,letterSpacing:"0.2em",textTransform:"uppercase",color:"#6a6258"}}>{a.type}</span>
                    <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,color:"rgba(201,168,76,0.3)"}}>#{a.numero}</span>
                  </div>
                  <p style={{fontFamily:"'Libre Baskerville',serif",fontSize:13,fontStyle:"italic",color:"#8a8070",marginBottom:12,lineHeight:1.7}}>&ldquo;{a.extrait}&rdquo;</p>
                  <p style={{fontSize:12,color:"#6a5a50",marginBottom:8,lineHeight:1.7}}><span style={{color:"rgba(201,168,76,0.5)"}}>Problème : </span>{a.probleme}</p>
                  <p style={{fontSize:12,color:"#8a8070",marginBottom:a.exemple_ameliore?10:0,lineHeight:1.7}}><span style={{color:"#c9a84c"}}>Suggestion : </span>{a.suggestion}</p>
                  {a.exemple_ameliore&&<div style={{borderLeft:"1px solid rgba(201,168,76,0.2)",paddingLeft:14,marginTop:8}}><p style={{fontSize:12,fontStyle:"italic",color:"#ede8dc",lineHeight:1.7}}>{a.exemple_ameliore}</p></div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes pulseStep{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes pulseAnim{0%,100%{box-shadow:0 0 0 0 rgba(201,168,76,0)}50%{box-shadow:0 0 0 8px rgba(201,168,76,0.1)}}`}</style>
    </main>
  )
}
