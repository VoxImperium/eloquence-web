"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import Link from "next/link"
import OrateurSilhouettes from "@/components/OrateurSilhouettes"

const PILLARS = [
  { num:"I",   title:"Analyse vocale",        desc:"Débit, pauses, expressivité. Chaque inflexion analysée avec la précision d'un maître de diction." },
  { num:"II",  title:"Joute verbale",          desc:"Affrontez des interlocuteurs IA incarnant les situations les plus exigeantes de la vie professionnelle." },
  { num:"III", title:"Entraînement socratique",desc:"500 sujets de philosophie et société. Le dialogue comme méthode d'élévation de la pensée." },
  { num:"IV",  title:"Réécriture oratoire",    desc:"Vos discours transformés selon les canons de la rhétorique classique — exorde, narration, péroraison." },
  {
    num: "V",
    title: "Plaidoirie juridique",
    desc: "Résolvez vos cas pratiques. Légifrance × Thémis génère votre plaidoirie complète.",
    tag: "Nouveau"
  },
  {
    num: "VI",
    title: "Grands Concours",
    desc: "Simulation CRFPA & ENM : préparez-vous aux plus grands défis de l'éloquence juridique.",
    tag: "Nouveau"
  }
]

const QUOTES = [
  { text:"La parole est la peinture de la pensée.", author:"Voltaire" },
  { text:"Parler est un besoin, écouter est un art.", author:"Goethe" },
]

export default function HomePage() {
  const [user, setUser] = useState(null)
  const [qi,   setQi]   = useState(0)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    const t = setInterval(() => setQi(q => (q + 1) % QUOTES.length), 5000)
    return () => clearInterval(t)
  }, [])

  return (
    <main style={{minHeight:"100vh"}}>

      {/* HERO */}
      <section style={{
        minHeight:"95vh", position:"relative",
        display:"flex", alignItems:"center", overflow:"hidden",
      }}>
        {/* Fond subtil */}
        <div style={{
          position:"absolute", inset:0,
          background:"radial-gradient(ellipse 70% 60% at 50% 100%, rgba(201,168,76,0.05) 0%, transparent 70%)",
          pointerEvents:"none",
        }}/>

        {/* Contenu */}
        <div className="hero-content-grid" style={{
          position:"relative", zIndex:10,
          width:"100%", maxWidth:1200,
          margin:"0 auto",
        }}>
          {/* Texte */}
          <div className="animate-fade-up">
            <div className="eyebrow" style={{marginBottom:28}}>Art oratoire & Intelligence artificielle</div>

            <h1 style={{
              fontFamily:"'Cormorant Garamond',serif",
              fontSize:"clamp(52px,6vw,84px)",
              fontWeight:300, lineHeight:1.0,
              letterSpacing:"-0.01em",
              marginBottom:32,
            }}>
              L&apos;art de<br/>
              <em style={{color:"#c9a84c", fontStyle:"italic"}}>convaincre</em><br/>
              sublimé.
              <span style={{
                display:"block",
                fontFamily:"'Raleway',sans-serif",
                fontSize:"0.22em",
                fontWeight:300,
                letterSpacing:"0.35em",
                color:"#6a6258",
                marginTop:16,
                fontStyle:"normal",
                textTransform:"uppercase",
              }}>
                Éloquence · Rhétorique · Maîtrise
              </span>
            </h1>

            <p style={{fontSize:14, lineHeight:1.95, color:"#6a6258", marginBottom:48, maxWidth:400, fontWeight:300}}>
              De Cicéron à De Gaulle, les grands orateurs ont façonné l&apos;histoire
              par la puissance de leur verbe. Aujourd&apos;hui, l&apos;intelligence artificielle
              vous permet d&apos;atteindre ce niveau d&apos;excellence.
            </p>

            <div style={{display:"flex", gap:20, flexWrap:"wrap"}}>
              {user ? (
                <Link href="/dashboard" className="btn-gold"><span className="btn-text">Mon espace →</span></Link>
              ) : (
                <>
                  <Link href="/login" className="btn-gold"><span className="btn-text">Commencer gratuitement</span></Link>
                  <Link href="/pricing" className="btn-outline">Découvrir les tarifs</Link>
                </>
              )}
            </div>
          </div>

          {/* Silhouettes */}
          <div className="hero-visual" style={{position:"relative", height:520}}>
            <OrateurSilhouettes />
            {/* Citation flottante */}
            <div style={{
              position:"absolute", bottom:40, left:-40,
              width:240, padding:"20px 24px",
              border:"1px solid rgba(201,168,76,0.2)",
              background:"rgba(10,10,15,0.92)",
              backdropFilter:"blur(12px)",
              transition:"opacity 0.6s",
            }}>
              <p style={{
                fontFamily:"'Cormorant Garamond',serif",
                fontSize:14, fontStyle:"italic", fontWeight:300,
                lineHeight:1.7, color:"#f5f0e8", marginBottom:10,
              }}>
                &ldquo;{QUOTES[qi].text}&rdquo;
              </p>
              <p style={{fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:"#c9a84c"}}>
                — {QUOTES[qi].author}
              </p>
            </div>
          </div>
        </div>

        {/* Règle dorée bas */}
        <div className="rule-gold" style={{position:"absolute", bottom:0, left:0, right:0}}/>
      </section>

      {/* SIX PILIERS */}
      <section style={{maxWidth:1200, margin:"0 auto", padding:"100px 48px"}}>
        <div style={{textAlign:"center", marginBottom:72}}>
          <div className="eyebrow" style={{justifyContent:"center", marginBottom:20}}>
            <span style={{width:40, height:1, background:"linear-gradient(90deg,transparent,#c9a84c)", display:"block"}}/>
            Maîtrisez l&apos;art oratoire
            <span style={{width:40, height:1, background:"linear-gradient(90deg,#c9a84c,transparent)", display:"block"}}/>
          </div>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(36px,4vw,56px)", fontWeight:300, lineHeight:1.15, marginBottom:16}}>
            Six piliers de <em style={{color:"#c9a84c"}}>l&apos;excellence</em>
          </h2>
          <p style={{fontSize:14, color:"#6a6258", maxWidth:440, margin:"0 auto", lineHeight:1.9}}>
            Des outils forgés pour les orateurs d&apos;exception.
          </p>
        </div>

        <div className="pillars-grid" style={{border:"1px solid rgba(201,168,76,0.2)"}}>
          {PILLARS.map((p, i) => (
            <a key={i} href={["/record","/simulate","/training","/speech-analysis","/legifrance","/grands-concours"][i]}
              className="pillar-item"
              style={{
                padding:"40px 28px",
                textDecoration:"none", color:"inherit",
                position:"relative", overflow:"hidden",
                transition:"background 0.4s",
                display:"block",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background="rgba(201,168,76,0.03)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background="transparent"}
            >
              <div style={{
                fontFamily:"'Cormorant Garamond',serif",
                fontSize:52, fontWeight:300,
                color:"rgba(201,168,76,0.12)", lineHeight:1,
                marginBottom:20,
              }}>{p.num}</div>
              <h3 style={{
                fontFamily:"'Cormorant Garamond',serif",
                fontSize:20, fontWeight:400,
                marginBottom:12, lineHeight:1.3,
                color:"#f5f0e8",
              }}>{p.title}</h3>
              <p style={{fontSize:12, color:"#6a6258", lineHeight:1.85, letterSpacing:"0.02em"}}>{p.desc}</p>
            </a>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="cta-section" style={{maxWidth:900, margin:"0 auto"}}>
        <div style={{
          border:"1px solid rgba(201,168,76,0.2)",
          padding:"64px 80px",
          position:"relative", overflow:"hidden",
          textAlign:"center",
        }}>
          <div style={{position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:120, height:1, background:"linear-gradient(90deg,transparent,#c9a84c,transparent)"}}/>
          <p className="ornament" style={{marginBottom:24}}>✦ ✦ ✦</p>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(32px,4vw,48px)", fontWeight:300, marginBottom:16}}>
            Prêt à vous élever ?
          </h2>
          <p style={{fontSize:13, color:"#6a6258", marginBottom:40, lineHeight:1.9}}>Commencez gratuitement. Aucune carte bancaire requise.</p>
          {user ? (
            <Link href="/dashboard" className="btn-gold"><span className="btn-text">Mon espace →</span></Link>
          ) : (
            <Link href="/login" className="btn-gold"><span className="btn-text">Créer mon compte gratuit</span></Link>
          )}
        </div>

        {/* Footer légal */}
        <div style={{display:"flex", justifyContent:"center", flexWrap:"wrap", gap:32, marginTop:48, paddingTop:32, borderTop:"1px solid rgba(201,168,76,0.08)"}}>
          <Link href="/faq" style={{fontSize:11, color:"#6a6258", letterSpacing:"0.1em", textDecoration:"none"}}>FAQ →</Link>
          <Link href="/cgu" style={{fontSize:11, color:"#6a6258", letterSpacing:"0.1em", textDecoration:"none"}}>CGU →</Link>
          <Link href="/mentions-legales" style={{fontSize:11, color:"#6a6258", letterSpacing:"0.1em", textDecoration:"none"}}>Mentions légales →</Link>
          <Link href="/pricing" style={{fontSize:11, color:"#6a6258", letterSpacing:"0.1em", textDecoration:"none"}}>Tarifs →</Link>
        </div>
      </section>

    </main>
  )
}
