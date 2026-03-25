"use client"
import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"

const PLANS = [
  {
    id:       "etudiant",
    label:    "Étudiant",
    price:    "5,99",
    priceInt: 599,
    priceId:  "  [0;32m✅[0m Éloquence Étudiant → Product: prod_UDHmQi60gxcmqy | Price: price_1TErCoH7DqnrXksXHnAK60pb
price_1TErCoH7DqnrXksXHnAK60pb",
    sub:      "Examens, concours, formations",
    note:     "Justificatif étudiant requis",
    features: [
      "10 analyses vocales / mois",
      "3 simulations / mois",
      "100 sujets d'entraînement",
      "4 analyses de discours / mois",
      "5 cas pratiques juridiques / mois",
      "Plaidoirie juridique — Thémis",
      "Historique 30 jours",
    ],
    excluded: ["Analyses illimitées", "Export PDF", "Accès API"],
    popular:  false,
  },
  {
    id:       "basique",
    label:    "Basique",
    price:    "9,99",
    priceInt: 999,
    priceId:  "  [0;32m✅[0m Éloquence Basique → Product: prod_UDHm3UXVwndsGl | Price: price_1TErCpH7DqnrXksX2ztfxJUU
price_1TErCpH7DqnrXksX2ztfxJUU",
    sub:      "Professionnels en développement",
    note:     null,
    features: [
      "Analyses vocales illimitées",
      "Simulations illimitées",
      "500 sujets d'entraînement",
      "Analyses de discours illimitées",
      "20 cas pratiques juridiques / mois",
      "Plaidoirie juridique — Thémis",
      "Export PDF des plaidoiries",
      "Historique complet",
    ],
    excluded: ["Accès API", "Multi-utilisateurs", "Support dédié"],
    popular:  true,
  },
  {
    id:       "entreprise",
    label:    "Entreprise",
    price:    "19,99",
    priceInt: 1999,
    priceId:  "  [0;32m✅[0m Éloquence Entreprise → Product: prod_UDHmRMvvsbdzHO | Price: price_1TErCqH7DqnrXksXJcW5LXNR
price_1TErCqH7DqnrXksXJcW5LXNR",
    sub:      "Cabinets, équipes, grandes écoles",
    note:     "Facturation annuelle : 2 mois offerts",
    features: [
      "Tout l'offre Basique",
      "Cas pratiques juridiques illimités",
      "Accès API complet",
      "Tableau de bord équipe",
      "Gestion multi-utilisateurs",
      "Intégration PISTE / Légifrance",
      "Rapports de progression équipe",
      "Support prioritaire 24h",
      "Formation onboarding incluse",
    ],
    excluded: [],
    popular:  false,
  },
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string|null>(null)
  const supabase = createClient()
  const router   = useRouter()

  const upgrade = async (plan: typeof PLANS[0]) => {
    setLoading(plan.id)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      const res = await fetch("/api/backend/payments/create-checkout", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          user_id:     user.id,
          user_email:  user.email,
          price_id:    plan.priceId,
          success_url: `${window.location.origin}/dashboard?success=true`,
          cancel_url:  `${window.location.origin}/pricing`,
        }),
      })
      const data = await res.json()
      if (data.checkout_url) window.location.href = data.checkout_url
    } catch(e) { console.error(e) }
    finally { setLoading(null) }
  }

  return (
    <main style={{minHeight:"100vh", padding:"100px 48px", maxWidth:1100, margin:"0 auto"}}>

      <div style={{textAlign:"center", marginBottom:72}}>
        <div className="eyebrow" style={{justifyContent:"center", marginBottom:20}}>
          <span style={{width:36, height:1, background:"linear-gradient(90deg,transparent,#c9a84c)", display:"block"}}/>
          Accès à l&apos;excellence
          <span style={{width:36, height:1, background:"linear-gradient(90deg,#c9a84c,transparent)", display:"block"}}/>
        </div>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(40px,5vw,64px)", fontWeight:300, lineHeight:1.1, marginBottom:16}}>
          Investissez dans<br/><em style={{color:"#c9a84c"}}>votre éloquence</em>
        </h1>
        <p style={{fontSize:13, color:"#6a6258", lineHeight:1.9}}>Sans engagement · Résiliation à tout moment · Paiement sécurisé Stripe</p>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20, marginBottom:48}}>
        {PLANS.map(plan => (
          <div key={plan.id} style={{
            border: plan.popular ? "1px solid rgba(201,168,76,0.5)" : "1px solid rgba(201,168,76,0.15)",
            padding:"40px 32px",
            background: plan.popular ? "rgba(201,168,76,0.02)" : "transparent",
            position:"relative",
            display:"flex", flexDirection:"column",
          }}>
            {plan.popular && (
              <div style={{
                position:"absolute", top:0, left:"50%", transform:"translateX(-50%)",
                fontFamily:"'Raleway',sans-serif", fontSize:9, letterSpacing:"0.2em", textTransform:"uppercase",
                color:"#0a0a0f", background:"#c9a84c", padding:"5px 16px", whiteSpace:"nowrap",
              }}>Recommandé</div>
            )}
            {plan.popular && <div style={{position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:80, height:1, background:"#c9a84c"}}/>}

            <p style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.3em", textTransform:"uppercase", color: plan.popular ? "#c9a84c" : "#6a6258", marginBottom:16}}>{plan.label}</p>
            <div style={{fontFamily:"'Cormorant Garamond',serif", fontSize:56, fontWeight:300, lineHeight:1, marginBottom:4, color: plan.popular ? "#c9a84c" : "#f5f0e8"}}>
              {plan.price}<span style={{fontSize:18, color:"rgba(201,168,76,0.4)"}}>€</span>
            </div>
            <p style={{fontSize:11, color:"#6a6258", marginBottom:8, letterSpacing:"0.1em"}}>par mois</p>
            <p style={{fontSize:12, color:"#6a6258", marginBottom:32, lineHeight:1.6}}>{plan.sub}</p>

            <div style={{height:1, background:"rgba(201,168,76,0.15)", marginBottom:24}}/>

            <ul style={{listStyle:"none", display:"flex", flexDirection:"column", gap:12, marginBottom:24, flex:1}}>
              {plan.features.map((f,i) => (
                <li key={i} style={{fontSize:12, color:"#ede8dc", display:"flex", gap:10, alignItems:"flex-start", lineHeight:1.6}}>
                  <span style={{color:"#c9a84c", flexShrink:0, marginTop:2}}>◆</span>{f}
                </li>
              ))}
              {plan.excluded.map((f,i) => (
                <li key={i} style={{fontSize:12, color:"#3a3830", display:"flex", gap:10, alignItems:"flex-start", lineHeight:1.6}}>
                  <span style={{flexShrink:0, marginTop:2}}>—</span>{f}
                </li>
              ))}
            </ul>

            {plan.note && (
              <p style={{fontSize:10, color:"#6a6258", letterSpacing:"0.05em", marginBottom:16, lineHeight:1.6, borderTop:"1px solid rgba(201,168,76,0.1)", paddingTop:12}}>{plan.note}</p>
            )}

            <button
              onClick={() => upgrade(plan)}
              disabled={loading === plan.id}
              className={plan.popular ? "btn-gold" : "btn-outline"}
              style={{width:"100%", justifyContent:"center"}}
            >
              {loading === plan.id
                ? <><span className="spinner-gold"/><span className={plan.popular ? "btn-text" : ""}>Redirection...</span></>
                : <span className={plan.popular ? "btn-text" : ""}>Choisir {plan.label} →</span>
              }
            </button>
          </div>
        ))}
      </div>

      <div style={{textAlign:"center", marginTop:48}}>
        <p style={{fontSize:12, color:"#6a6258", lineHeight:2}}>
          Toutes les offres incluent l&apos;accès à Éloquence de Thémis — notre moteur de plaidoirie juridique.<br/>
          Paiement sécurisé par Stripe · TVA incluse · Annulation à tout moment depuis votre espace personnel.
        </p>
        <div style={{display:"flex", justifyContent:"center", gap:32, marginTop:24}}>
          <Link href="/record" style={{fontSize:11, color:"#6a6258", letterSpacing:"0.1em", textDecoration:"none"}}>Essai gratuit →</Link>
          <Link href="/legifrance" style={{fontSize:11, color:"#6a6258", letterSpacing:"0.1em", textDecoration:"none"}}>Tester Thémis →</Link>
          <Link href="/dashboard" style={{fontSize:11, color:"#6a6258", letterSpacing:"0.1em", textDecoration:"none"}}>Mon compte →</Link>
        </div>
      </div>

    </main>
  )
}
