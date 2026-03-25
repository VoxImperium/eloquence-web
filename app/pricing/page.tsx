"use client"
import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function PricingPage() {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router   = useRouter()

  const upgrade = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      const res = await fetch("/api/backend/payments/create-checkout", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ user_id:user.id, user_email:user.email,
          success_url:`${window.location.origin}/dashboard?success=true`,
          cancel_url:`${window.location.origin}/pricing` })
      })
      const data = await res.json()
      if (data.checkout_url) window.location.href = data.checkout_url
    } catch(e){ console.error(e) }
    finally { setLoading(false) }
  }

  return (
    <main style={{minHeight:"100vh", padding:"100px 48px", maxWidth:960, margin:"0 auto"}}>

      <div style={{textAlign:"center", marginBottom:72}}>
        <div className="eyebrow" style={{justifyContent:"center", marginBottom:20}}>
          <span style={{width:36, height:1, background:"linear-gradient(90deg,transparent,#c9a84c)", display:"block"}}/>
          Accès à l&apos;excellence
          <span style={{width:36, height:1, background:"linear-gradient(90deg,#c9a84c,transparent)", display:"block"}}/>
        </div>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(40px,5vw,64px)", fontWeight:300, lineHeight:1.1, marginBottom:16}}>
          Investissez dans<br/><em style={{color:"#c9a84c"}}>votre éloquence</em>
        </h1>
        <p style={{fontSize:13, color:"#6a6258", lineHeight:1.9}}>Commencez gratuitement. Évoluez sans limite.</p>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:24}}>

        {/* Free */}
        <div style={{border:"1px solid rgba(201,168,76,0.15)", padding:"48px 40px"}}>
          <p style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.3em", textTransform:"uppercase", color:"#6a6258", marginBottom:20}}>Gratuit</p>
          <div style={{fontFamily:"'Cormorant Garamond',serif", fontSize:64, fontWeight:300, lineHeight:1, marginBottom:4}}>0<span style={{fontSize:20, color:"#6a6258"}}>€</span></div>
          <p style={{fontSize:11, color:"#6a6258", marginBottom:36, letterSpacing:"0.1em"}}>Pour toujours</p>
          <div style={{height:1, background:"rgba(201,168,76,0.1)", marginBottom:32}}/>
          <ul style={{listStyle:"none", display:"flex", flexDirection:"column", gap:14, marginBottom:36}}>
            {["5 analyses vocales / mois","Transcription Whisper","Métriques vocales","Mots parasites détectés","Accès à l'entraînement"].map(f => (
              <li key={f} style={{fontSize:12, color:"#8a8070", display:"flex", gap:12, alignItems:"flex-start"}}>
                <span style={{color:"rgba(201,168,76,0.5)", flexShrink:0}}>◆</span>{f}
              </li>
            ))}
          </ul>
          <Link href="/record" className="btn-outline" style={{display:"block", textAlign:"center", justifyContent:"center"}}><span>Commencer gratuitement</span></Link>
        </div>

        {/* Pro */}
        <div style={{border:"1px solid rgba(201,168,76,0.45)", padding:"48px 40px", position:"relative", background:"rgba(201,168,76,0.02)"}}>
          <div style={{position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:80, height:1, background:"#c9a84c"}}/>
          <div style={{
            position:"absolute", top:20, right:24,
            fontFamily:"'Raleway',sans-serif", fontSize:9, letterSpacing:"0.2em", textTransform:"uppercase",
            color:"#0a0a0f", background:"#c9a84c", padding:"5px 14px",
          }}>Recommandé</div>
          <p style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.3em", textTransform:"uppercase", color:"#c9a84c", marginBottom:20}}>Pro</p>
          <div style={{fontFamily:"'Cormorant Garamond',serif", fontSize:64, fontWeight:300, lineHeight:1, marginBottom:4, color:"#c9a84c"}}>19<span style={{fontSize:20, color:"rgba(201,168,76,0.5)"}}>€</span></div>
          <p style={{fontSize:11, color:"#6a6258", marginBottom:36, letterSpacing:"0.1em"}}>par mois · sans engagement</p>
          <div style={{height:1, background:"rgba(201,168,76,0.2)", marginBottom:32}}/>
          <ul style={{listStyle:"none", display:"flex", flexDirection:"column", gap:14, marginBottom:36}}>
            {["Analyses vocales illimitées","Feedback IA complet avec scores /10","Conseil prioritaire personnalisé","Historique de toutes vos sessions","5 scénarios de simulation d'élite","500 sujets d'entraînement socratique","Analyse & réécriture de discours complète",
              "Plaidoirie juridique — Légifrance × Thémis","Support prioritaire"].map(f => (
              <li key={f} style={{fontSize:12, color:"#ede8dc", display:"flex", gap:12, alignItems:"flex-start"}}>
                <span style={{color:"#c9a84c", flexShrink:0}}>◆</span>{f}
              </li>
            ))}
          </ul>
          <button onClick={upgrade} disabled={loading} className="btn-gold" style={{width:"100%", justifyContent:"center"}}>
            {loading ? <><span className="spinner-gold"/><span className="btn-text">Redirection...</span></> : <span className="btn-text">Accéder au plan Pro →</span>}
          </button>
        </div>
      </div>

      {/* Garantie */}
      <div style={{textAlign:"center", marginTop:48}}>
        <p style={{fontSize:11, color:"#6a6258", letterSpacing:"0.08em", lineHeight:1.9}}>
          Paiement sécurisé par Stripe · Annulation à tout moment · Aucun engagement
        </p>
      </div>

    </main>
  )
}
