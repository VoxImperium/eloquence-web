"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ResultsPage() {
  const [result, setResult] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const raw = sessionStorage.getItem("lastResult")
    if (!raw) { router.push("/record"); return }
    setResult(JSON.parse(raw))
  }, [])

  if (!result) return (
    <main style={{minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center"}}>
      <div style={{display:"flex", flexDirection:"column", alignItems:"center", gap:20}}>
        <div style={{width:40, height:40, border:"1px solid rgba(201,168,76,0.3)", borderTop:"1px solid #c9a84c", borderRadius:"50%", animation:"spin 1s linear infinite"}}/>
        <p style={{fontFamily:"'Cormorant Garamond',serif", fontSize:18, color:"#6a6258", fontStyle:"italic"}}>Chargement de l&apos;analyse...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  )

  const { feedback, audio_metrics, filler_words, transcript, word_count } = result
  const scores = feedback?.scores || {}

  const scoreColor = (n: number) => n >= 7 ? "#c9a84c" : n >= 5 ? "#8a8070" : "#6a5a50"
  const scoreLabel = (n: number) => n >= 8 ? "Excellent" : n >= 6 ? "Bon" : n >= 4 ? "À améliorer" : "Insuffisant"

  return (
    <main style={{minHeight:"100vh", padding:"80px 24px"}}>
      <div style={{maxWidth:760, margin:"0 auto"}}>

        {/* Header */}
        <div style={{marginBottom:48}}>
          <Link href="/record" style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:"#6a6258", textDecoration:"none"}}>← Nouvel enregistrement</Link>
          <div style={{display:"flex", alignItems:"baseline", justifyContent:"space-between", marginTop:20}}>
            <h1 style={{fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(36px,5vw,56px)", fontWeight:300, lineHeight:1.1}}>
              Votre <em style={{color:"#c9a84c"}}>analyse</em>
            </h1>
            <p style={{fontFamily:"'Raleway',sans-serif", fontSize:11, color:"#6a6258", letterSpacing:"0.1em"}}>{word_count} mots · {audio_metrics?.duration_seconds}s</p>
          </div>
        </div>

        <div style={{height:1, background:"linear-gradient(90deg,transparent,rgba(201,168,76,0.4),transparent)", marginBottom:48}}/>

        {/* Score global */}
        <div style={{
          border:"1px solid rgba(201,168,76,0.2)",
          padding:"48px",
          textAlign:"center",
          marginBottom:32,
          position:"relative",
          overflow:"hidden",
        }}>
          <div style={{position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:80, height:1, background:"#c9a84c"}}/>
          <p style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.3em", textTransform:"uppercase", color:"#6a6258", marginBottom:16}}>Score global</p>
          <div style={{fontFamily:"'Cormorant Garamond',serif", fontSize:96, fontWeight:300, color:"#c9a84c", lineHeight:1, marginBottom:8}}>
            {scores.global || 0}<span style={{fontSize:36, color:"rgba(201,168,76,0.4)"}}>/10</span>
          </div>
          <p style={{fontFamily:"'Cormorant Garamond',serif", fontSize:16, fontStyle:"italic", color:"#8a8070", marginTop:8}}>{scoreLabel(scores.global || 0)}</p>
          {feedback?.resume && (
            <p style={{fontSize:13, color:"#6a6258", marginTop:20, lineHeight:1.9, maxWidth:500, margin:"20px auto 0"}}>{feedback.resume}</p>
          )}
        </div>

        {/* Scores détaillés */}
        <div style={{border:"1px solid rgba(201,168,76,0.15)", padding:"32px", marginBottom:24}}>
          <p style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.3em", textTransform:"uppercase", color:"#6a6258", marginBottom:28}}>Scores détaillés</p>
          <div style={{display:"flex", flexDirection:"column", gap:20}}>
            {[
              ["Fluidité",    scores.fluidite],
              ["Structure",   scores.structure],
              ["Vocabulaire", scores.vocabulaire],
              ["Rythme",      scores.rythme],
            ].map(([label, val]: any) => (
              <div key={label}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:8}}>
                  <span style={{fontFamily:"'Cormorant Garamond',serif", fontSize:16, color:"#f5f0e8"}}>{label}</span>
                  <span style={{fontFamily:"'Raleway',sans-serif", fontSize:12, color:scoreColor(val), letterSpacing:"0.1em"}}>{val}/10</span>
                </div>
                <div style={{height:1, background:"rgba(201,168,76,0.08)"}}>
                  <div style={{height:1, background:"linear-gradient(90deg,#a88830,#c9a84c)", width:`${(val/10)*100}%`, transition:"width 1.2s cubic-bezier(0.4,0,0.2,1)"}}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conseil */}
        {feedback?.conseil_prioritaire && (
          <div style={{borderLeft:"2px solid #c9a84c", paddingLeft:24, marginBottom:24}}>
            <p style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.25em", textTransform:"uppercase", color:"#c9a84c", marginBottom:12}}>Conseil prioritaire</p>
            <p style={{fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontStyle:"italic", fontWeight:300, lineHeight:1.7, color:"#f5f0e8"}}>{feedback.conseil_prioritaire}</p>
          </div>
        )}

        {/* Points forts / axes */}
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24}}>
          {[
            ["Points forts", feedback?.points_forts, "#c9a84c"],
            ["À améliorer",  feedback?.axes_amelioration, "#8a8070"],
          ].map(([title, items, color]: any) => (
            <div key={title} style={{border:"1px solid rgba(201,168,76,0.15)", padding:"24px"}}>
              <p style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.25em", textTransform:"uppercase", color, marginBottom:16}}>{title}</p>
              <ul style={{listStyle:"none", display:"flex", flexDirection:"column", gap:10}}>
                {(items || []).map((p: string, i: number) => (
                  <li key={i} style={{fontSize:12, color:"#6a6258", lineHeight:1.7, paddingLeft:16, position:"relative"}}>
                    <span style={{position:"absolute", left:0, color}}>&rsaquo;</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Métriques vocales */}
        <div style={{border:"1px solid rgba(201,168,76,0.15)", padding:"24px 32px", marginBottom:24}}>
          <p style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.3em", textTransform:"uppercase", color:"#6a6258", marginBottom:24}}>Métriques vocales</p>
          <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16}}>
            {[
              ["Débit",           `${audio_metrics?.speech_rate_wpm}`, "mots/min", audio_metrics?.speech_rate_rating],
              ["Pauses",          `${audio_metrics?.pause_count}`,     "détectées", `moy. ${audio_metrics?.avg_pause_s}s`],
              ["Expressivité",    audio_metrics?.pitch_rating,         "",           `variation ${audio_metrics?.pitch_variation}`],
              ["Mots parasites",  `${filler_words?.total}`,            "trouvés",    Object.keys(filler_words?.details || {}).join(", ") || "aucun ✓"],
            ].map(([label, val, unit, sub]: any) => (
              <div key={label} style={{borderTop:"1px solid rgba(201,168,76,0.15)", paddingTop:16}}>
                <p style={{fontFamily:"'Raleway',sans-serif", fontSize:9, letterSpacing:"0.2em", textTransform:"uppercase", color:"#6a6258", marginBottom:8}}>{label}</p>
                <p style={{fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:300, color:"#c9a84c"}}>{val} <span style={{fontSize:12, color:"rgba(201,168,76,0.5)"}}>{unit}</span></p>
                <p style={{fontSize:10, color:"#6a6258", marginTop:4, letterSpacing:"0.03em"}}>{sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Transcription */}
        <div style={{border:"1px solid rgba(201,168,76,0.1)", padding:"24px 32px", marginBottom:40}}>
          <p style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.3em", textTransform:"uppercase", color:"#6a6258", marginBottom:16}}>Transcription</p>
          <p style={{fontFamily:"'Libre Baskerville',serif", fontSize:13, color:"#6a6258", lineHeight:2, fontStyle:"italic"}}>{transcript}</p>
        </div>

        <Link href="/record" className="btn-gold" style={{width:"100%", justifyContent:"center", display:"flex"}}>
          <span className="btn-text">Nouvel enregistrement</span>
        </Link>
      </div>
    </main>
  )
}
