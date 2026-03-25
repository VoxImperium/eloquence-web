"use client"
import { useState, useRef } from "react"
import Link from "next/link"

const DOMAINES = [
  {id:"civil",         label:"Droit civil",        ex:"Accident, contrat, famille"},
  {id:"penal",         label:"Droit pénal",         ex:"Escroquerie, violence, vol"},
  {id:"social",        label:"Droit du travail",    ex:"Licenciement, harcèlement"},
  {id:"commercial",    label:"Droit commercial",    ex:"Société, faillite, concurrence"},
  {id:"administratif", label:"Droit administratif", ex:"Permis, fonction publique"},
  {id:"consommation",  label:"Droit de la conso",   ex:"Produit défectueux, tromperie"},
]

const STEPS = [
  "Qualification juridique des faits",
  "Identification des articles applicables",
  "Recherche jurisprudentielle",
  "Construction de la stratégie",
  "Rédaction de la plaidoirie par Thémis",
]

export default function LegifrangePage() {
  const [faits,       setFaits]       = useState("")
  const [domaine,     setDomaine]     = useState("civil")
  const [position,    setPosition]    = useState("demandeur")
  const [loading,     setLoading]     = useState(false)
  const [pdfLoading,  setPdfLoading]  = useState(false)
  const [result,      setResult]      = useState<any>(null)
  const [step,        setStep]        = useState(0)
  const [tab,         setTab]         = useState("plaidoirie")
  const [inputMode,   setInputMode]   = useState<"text"|"pdf">("text")
  const [pdfName,     setPdfName]     = useState("")
  const [pdfInfo,     setPdfInfo]     = useState<any>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handlePdf = async (file: File) => {
    if (!file) return
    setPdfLoading(true)
    setPdfName(file.name)
    try {
      const form = new FormData()
      form.append("file", file)
      const res = await fetch("/api/backend/legifrance/extract-pdf", {
        method: "POST",
        body: form,
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.detail || "Erreur extraction PDF")
        return
      }
      const data = await res.json()
      setFaits(data.text)
      setPdfInfo(data)
    } catch {
      alert("Erreur lors de la lecture du PDF")
    } finally {
      setPdfLoading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file?.type === "application/pdf") handlePdf(file)
  }

  const resoudre = async () => {
    if (!faits.trim()) return
    setLoading(true); setResult(null); setStep(0)
    const iv = setInterval(() => setStep(s => s < STEPS.length - 1 ? s + 1 : s), 8000)
    try {
      const res = await fetch("/api/backend/legifrance/cas-pratique", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({faits, domaine, position}),
      })
      const data = await res.json()
      setResult(data); setTab("plaidoirie")
    } catch { alert("Erreur lors de l'analyse") }
    clearInterval(iv); setLoading(false)
  }

  const formatTirade = (text: string) => {
    if (!text) return null
    return text.split("\n\n").map((para, i) => {
      if (!para.trim()) return null
      const isTitle = ["EXORDE","NARRATION","CONFIRMATION","RÉFUTATION","PÉRORAISON"].includes(para.trim())
      if (isTitle) return (
        <div key={i} style={{fontFamily:"'Raleway',sans-serif",fontSize:9,letterSpacing:"0.35em",textTransform:"uppercase",color:"#c9a84c",marginTop:32,marginBottom:12}}>{para.trim()}</div>
      )
      const fmt = para
        .replace(/\[\s*\/\s*\]/g, '<span style="color:rgba(201,168,76,0.5);font-size:11px;margin:0 4px" title="Respiration">❙</span>')
        .replace(/\[\s*\/\/\s*\]/g, '<span style="color:#c9a84c;font-size:13px;margin:0 6px" title="Silence 2s">❚❚</span>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#f5f0e8;font-weight:600">$1</strong>')
      return <p key={i} style={{fontFamily:"'Libre Baskerville',serif",fontSize:14,lineHeight:2.1,color:"#d4cfc4",textAlign:"justify",marginBottom:16}} dangerouslySetInnerHTML={{__html:fmt}}/>
    })
  }

  return (
    <main style={{minHeight:"100vh", padding:"80px 48px", maxWidth:960, margin:"0 auto"}}>

      {/* Header */}
      <div style={{marginBottom:48}}>
        <Link href="/" style={{fontFamily:"'Raleway',sans-serif",fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:"#6a6258",textDecoration:"none"}}>← Retour</Link>
        <div style={{marginTop:20,marginBottom:16}}>
          <span style={{fontFamily:"'Raleway',sans-serif",fontSize:10,letterSpacing:"0.3em",textTransform:"uppercase",color:"#c9a84c"}}>Légifrance × Thémis</span>
        </div>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(36px,5vw,56px)",fontWeight:300,lineHeight:1.1}}>
          Résolution de <em style={{color:"#c9a84c"}}>cas pratiques</em>
        </h1>
        <p style={{fontSize:13,color:"#6a6258",marginTop:12,lineHeight:1.9,maxWidth:560}}>
          Déposez votre sujet PDF ou décrivez votre cas. Thémis identifie les articles, recherche la jurisprudence et plaide pour vous.
        </p>
      </div>

      <div style={{height:1,background:"linear-gradient(90deg,transparent,rgba(201,168,76,0.3),transparent)",marginBottom:40}}/>

      {/* Domaine */}
      <div style={{marginBottom:20}}>
        <p style={{fontFamily:"'Raleway',sans-serif",fontSize:10,letterSpacing:"0.25em",textTransform:"uppercase",color:"#6a6258",marginBottom:14}}>Domaine juridique</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
          {DOMAINES.map(d => (
            <button key={d.id} onClick={() => setDomaine(d.id)} style={{
              padding:"14px 16px",textAlign:"left",
              border:`1px solid ${domaine===d.id?"rgba(201,168,76,0.5)":"rgba(201,168,76,0.12)"}`,
              background:domaine===d.id?"rgba(201,168,76,0.05)":"transparent",
              cursor:"pointer",transition:"all 0.3s",
            }}>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,color:domaine===d.id?"#c9a84c":"#f5f0e8",marginBottom:4}}>{d.label}</p>
              <p style={{fontSize:10,color:"#6a6258",lineHeight:1.5}}>{d.ex}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Position */}
      <div style={{display:"flex",gap:8,marginBottom:24}}>
        {[["demandeur","Je suis demandeur / plaignant"],["defenseur","Je suis défendeur / mis en cause"]].map(([v,l]) => (
          <button key={v} onClick={() => setPosition(v)} style={{
            flex:1,padding:"12px",
            border:`1px solid ${position===v?"rgba(201,168,76,0.5)":"rgba(201,168,76,0.12)"}`,
            background:position===v?"rgba(201,168,76,0.05)":"transparent",
            cursor:"pointer",transition:"all 0.3s",
            fontFamily:"'Raleway',sans-serif",fontSize:10,letterSpacing:"0.1em",
            color:position===v?"#c9a84c":"#6a6258",
          }}>{l}</button>
        ))}
      </div>

      {/* Mode saisie */}
      <div style={{display:"flex",gap:4,marginBottom:20}}>
        {[["text","✏️ Saisie manuelle"],["pdf","📄 Importer un PDF"]].map(([m,l]) => (
          <button key={m} onClick={() => setInputMode(m as any)} style={{
            fontFamily:"'Raleway',sans-serif",fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",
            padding:"10px 24px",
            border:`1px solid ${inputMode===m?"rgba(201,168,76,0.5)":"rgba(201,168,76,0.15)"}`,
            background:inputMode===m?"rgba(201,168,76,0.05)":"transparent",
            cursor:"pointer",color:inputMode===m?"#c9a84c":"#6a6258",transition:"all 0.3s",
          }}>{l}</button>
        ))}
      </div>

      {/* Zone PDF */}
      {inputMode === "pdf" && (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          style={{
            border:"1px dashed rgba(201,168,76,0.3)",
            padding:"48px",textAlign:"center",
            cursor:"pointer",marginBottom:20,
            background:"rgba(201,168,76,0.02)",
            transition:"all 0.3s",
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor="rgba(201,168,76,0.5)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor="rgba(201,168,76,0.3)"}
        >
          <input ref={fileRef} type="file" accept=".pdf" style={{display:"none"}}
            onChange={e => { const f = e.target.files?.[0]; if(f) handlePdf(f) }}/>

          {pdfLoading ? (
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
              <div style={{width:32,height:32,border:"1px solid rgba(201,168,76,0.3)",borderTop:"1px solid #c9a84c",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
              <p style={{fontFamily:"'Raleway',sans-serif",fontSize:11,letterSpacing:"0.15em",color:"#6a6258"}}>Extraction du texte en cours...</p>
            </div>
          ) : pdfName ? (
            <div>
              <p style={{fontSize:32,marginBottom:12}}>📄</p>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:"#c9a84c",marginBottom:8}}>{pdfName}</p>
              {pdfInfo && (
                <p style={{fontSize:11,color:"#6a6258"}}>
                  {pdfInfo.original_length} mots extraits
                  {pdfInfo.summarized && " — résumé automatique appliqué"}
                </p>
              )}
              <p style={{fontSize:10,color:"#6a6258",marginTop:12,letterSpacing:"0.1em"}}>Cliquez pour changer de fichier</p>
            </div>
          ) : (
            <div>
              <p style={{fontSize:40,marginBottom:16}}>📄</p>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:"#f5f0e8",marginBottom:8}}>Déposez votre sujet PDF ici</p>
              <p style={{fontSize:12,color:"#6a6258",lineHeight:1.7}}>
                Arrêt, sujet d&apos;examen, cas pratique, article de code<br/>
                ou glissez-déposez directement le fichier
              </p>
              <p style={{fontSize:10,color:"#6a6258",marginTop:16,letterSpacing:"0.1em"}}>Format PDF · Max 10 MB</p>
            </div>
          )}
        </div>
      )}

      {/* Zone texte — affichée dans les deux modes */}
      <div style={{marginBottom:20}}>
        {inputMode === "text" && (
          <p style={{fontFamily:"'Raleway',sans-serif",fontSize:10,letterSpacing:"0.25em",textTransform:"uppercase",color:"#6a6258",marginBottom:14}}>Exposé des faits</p>
        )}
        {inputMode === "pdf" && faits && (
          <div style={{marginBottom:12}}>
            <p style={{fontFamily:"'Raleway',sans-serif",fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:"#6a6258",marginBottom:8}}>
              Texte extrait — modifiable si nécessaire
            </p>
          </div>
        )}
        <textarea value={faits} onChange={e => setFaits(e.target.value)}
          placeholder={inputMode==="pdf"
            ? "Le texte extrait du PDF apparaîtra ici. Vous pouvez le modifier avant l'analyse..."
            : "Décrivez votre cas avec précision.\n\nExemple : Mon client a été licencié le 15 mars 2024 après 8 ans d'ancienneté. Son employeur lui reproche une prétendue insuffisance professionnelle mais n'a jamais effectué d'entretien annuel ni de mise en garde préalable..."
          }
          className="input-box" rows={inputMode==="pdf"?6:8} style={{marginBottom:16}}/>

        <button onClick={resoudre} disabled={!faits.trim()||loading} className="btn-gold" style={{width:"100%",justifyContent:"center"}}>
          {loading
            ? <><span className="spinner-gold"/><span className="btn-text">Thémis instruit le dossier...</span></>
            : <span className="btn-text">🏛️ Instruire le dossier et plaider →</span>
          }
        </button>
      </div>

      {/* Progress */}
      {loading && (
        <div style={{border:"1px solid rgba(201,168,76,0.12)",padding:"28px 32px",marginBottom:24}}>
          <div style={{height:1,background:"rgba(201,168,76,0.15)",marginBottom:4,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,height:"100%",background:"linear-gradient(90deg,transparent,#c9a84c,transparent)",width:"40%",animation:"sweepAnim 2s ease-in-out infinite"}}/>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:20}}>
            {STEPS.map((s,i) => (
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
      {result && (
        <div style={{marginTop:40}}>

          {/* Qualification */}
          <div style={{border:"1px solid rgba(201,168,76,0.2)",padding:"24px 32px",marginBottom:24,position:"relative"}}>
            <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:60,height:1,background:"#c9a84c"}}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
              <div>
                <p style={{fontFamily:"'Raleway',sans-serif",fontSize:9,letterSpacing:"0.25em",textTransform:"uppercase",color:"#6a6258",marginBottom:8}}>Qualification juridique</p>
                <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,color:"#f5f0e8",lineHeight:1.6}}>{result.qualification||result.analyse_juridique?.qualification_juridique}</p>
              </div>
              <div>
                <p style={{fontFamily:"'Raleway',sans-serif",fontSize:9,letterSpacing:"0.25em",textTransform:"uppercase",color:"#6a6258",marginBottom:8}}>Stratégie</p>
                <p style={{fontSize:12,color:"#8a8070",lineHeight:1.7}}>{result.strategie||result.analyse_juridique?.strategie}</p>
              </div>
            </div>
            <div style={{display:"flex",gap:16,marginTop:16}}>
              <span style={{fontFamily:"'Raleway',sans-serif",fontSize:10,color:"#6a6258"}}>{result.nb_articles} article(s)</span>
              <span style={{color:"rgba(201,168,76,0.3)"}}>·</span>
              <span style={{fontFamily:"'Raleway',sans-serif",fontSize:10,color:"#6a6258"}}>{result.nb_jurisprudence} arrêt(s)</span>
            </div>
          </div>

          {/* Essence */}
          {result.essence_du_drame && (
            <div style={{borderLeft:"2px solid #c9a84c",paddingLeft:24,marginBottom:24}}>
              <p style={{fontFamily:"'Raleway',sans-serif",fontSize:9,letterSpacing:"0.3em",textTransform:"uppercase",color:"#c9a84c",marginBottom:10}}>🏛️ L&apos;Essence du Drame</p>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontStyle:"italic",fontWeight:300,lineHeight:1.7,color:"#f5f0e8"}}>{result.essence_du_drame}</p>
            </div>
          )}

          {/* Tabs */}
          <div style={{display:"flex",borderBottom:"1px solid rgba(201,168,76,0.15)",marginBottom:28}}>
            {[["plaidoirie","🗣️ Plaidoirie"],["fondements","Fondements juridiques"],["jurisprudence","Jurisprudence"]].map(([t,l]) => (
              <button key={t} onClick={() => setTab(t)} style={{
                fontFamily:"'Raleway',sans-serif",fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",
                padding:"12px 24px",border:"none",background:"transparent",cursor:"pointer",
                color:tab===t?"#c9a84c":"#6a6258",
                borderBottom:tab===t?"1px solid #c9a84c":"1px solid transparent",
                transition:"all 0.3s",marginBottom:-1,
              }}>{l}</button>
            ))}
          </div>

          {tab==="plaidoirie" && (
            <div>
              <div style={{display:"flex",gap:24,marginBottom:20,padding:"12px 20px",border:"1px solid rgba(201,168,76,0.1)",background:"rgba(201,168,76,0.02)"}}>
                <p style={{fontSize:11,color:"#6a6258"}}><span style={{color:"rgba(201,168,76,0.5)",marginRight:6}}>❙</span>Respiration courte</p>
                <p style={{fontSize:11,color:"#6a6258"}}><span style={{color:"#c9a84c",marginRight:6}}>❚❚</span>Silence 2 secondes</p>
                <p style={{fontSize:11,color:"#6a6258"}}><strong style={{color:"#f5f0e8",marginRight:6}}>Gras</strong>Appuyer la voix</p>
              </div>
              <div style={{border:"1px solid rgba(201,168,76,0.15)",padding:"40px 48px",background:"rgba(12,11,18,0.6)",marginBottom:20}}>
                {formatTirade(result.tirade_oratoire)}
              </div>
              <button onClick={() => navigator.clipboard.writeText(result.tirade_oratoire)} className="btn-outline" style={{width:"100%",justifyContent:"center"}}>
                <span>Copier la plaidoirie</span>
              </button>
            </div>
          )}

          {tab==="fondements" && (
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {(result.articles_cites||[]).map((a: any,i: number) => (
                <div key={i} style={{border:`1px solid ${a.favorable?"rgba(201,168,76,0.25)":"rgba(201,168,76,0.08)"}`,padding:"20px 24px"}}>
                  <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:10}}>
                    <div>
                      <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,color:"#c9a84c"}}>{a.code}</span>
                      <span style={{fontFamily:"'Raleway',sans-serif",fontSize:10,color:"#6a6258",marginLeft:12,letterSpacing:"0.1em"}}>Art. {a.numero}</span>
                    </div>
                    <span style={{fontSize:10,color:a.favorable?"#c9a84c":"#8a8070",border:`1px solid ${a.favorable?"rgba(201,168,76,0.3)":"rgba(201,168,76,0.1)"}`,padding:"3px 10px"}}>
                      {a.favorable?"Pour nous":"Neutre"}
                    </span>
                  </div>
                  <p style={{fontFamily:"'Libre Baskerville',serif",fontSize:13,fontStyle:"italic",color:"#8a8070",lineHeight:1.8,marginBottom:10}}>{a.texte}</p>
                  {a.pertinence&&<p style={{fontSize:11,color:"#6a6258",lineHeight:1.6}}><span style={{color:"rgba(201,168,76,0.5)"}}>Application : </span>{a.pertinence}</p>}
                </div>
              ))}
            </div>
          )}

          {tab==="jurisprudence" && (
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {(result.jurisprudence||[]).length > 0 ? (result.jurisprudence||[]).map((j: any,i: number) => (
                <div key={i} style={{border:"1px solid rgba(201,168,76,0.12)",padding:"20px 24px"}}>
                  <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:10}}>
                    <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:"#f5f0e8"}}>Cass. {j.chambre} — {j.date}</p>
                    <span style={{fontFamily:"'Raleway',sans-serif",fontSize:9,color:"#6a6258",letterSpacing:"0.1em"}}>n°{j.numero}</span>
                  </div>
                  {j.solution&&<p style={{fontSize:11,color:"#c9a84c",marginBottom:8}}>{j.solution}</p>}
                  <p style={{fontSize:12,color:"#6a6258",lineHeight:1.8}}>{j.resume}</p>
                </div>
              )) : (
                <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,fontStyle:"italic",color:"#6a6258",textAlign:"center",padding:32}}>
                  Aucune jurisprudence trouvée via l&apos;API publique.<br/>
                  <span style={{fontSize:13}}>Connectez PISTE pour accéder à la base complète.</span>
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes pulseStep{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes sweepAnim{0%{transform:translateX(-200%)}100%{transform:translateX(300%)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </main>
  )
}
