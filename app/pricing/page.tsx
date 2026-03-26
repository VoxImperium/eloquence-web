"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"

const FREE_PLAN = {
  id:       "free",
  label:    "Gratuit",
  price:    "0",
  features: [
    "2 analyses vocales / mois",
    "1 simulation / mois",
    "20 sujets d'entraînement",
    "1 analyse de discours / mois",
    "Historique 7 jours",
  ],
  excluded: ["Cas pratiques juridiques", "Export PDF", "Thémis"],
}

const PAID_PLANS = [
  {
    id:       "basique",
    label:    "Basique",
    price:    "7,99",
    priceInt: 799,
    priceId:  process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIQUE!,
    sub:      "Pour progresser régulièrement",
    note:     null,
    features: [
      "10 analyses vocales / mois",
      "5 simulations / mois",
      "200 sujets d'entraînement",
      "5 analyses de discours / mois",
      "10 cas pratiques juridiques / mois",
      "Plaidoirie juridique — Thémis",
      "Historique 30 jours",
    ],
    excluded: ["Analyses illimitées", "Export PDF"],
    popular:  false,
  },
  {
    id:       "illimite",
    label:    "Illimité",
    price:    "15,99",
    priceInt: 1599,
    priceId:  process.env.NEXT_PUBLIC_STRIPE_PRICE_ILLIMITE!,
    sub:      "Tout illimité, sans restriction",
    note:     null,
    features: [
      "Analyses vocales illimitées",
      "Simulations illimitées",
      "Sujets d'entraînement illimités",
      "Analyses de discours illimitées",
      "Cas pratiques juridiques illimités",
      "Plaidoirie juridique — Thémis",
      "Export PDF des plaidoiries",
      "Historique complet",
    ],
    excluded: [],
    popular:  true,
  },
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string|null>(null)
  const [error, setError] = useState<string|null>(null)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()
  const router   = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  const upgrade = async (plan: typeof PAID_PLANS[0]) => {
    setLoading(plan.id)
    setError(null)
    try {
      if (!plan.priceId) {
        setError("Prix non configuré. Contactez le support.")
        return
      }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      console.log("[checkout] priceId =", plan.priceId)
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
      console.log("[checkout] response =", data)
      if (!res.ok || data.error) {
        setError(data.error ?? "Erreur lors de la création du paiement.")
        return
      }
      if (data.checkout_url) window.location.href = data.checkout_url
      else setError("URL de paiement manquante.")
    } catch(e: any) {
      console.error(e)
      setError(e.message || "Une erreur est survenue.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <main className="pricing-page-main">

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

      {error && (
        <div style={{
          border: "1px solid rgba(201,80,76,0.4)",
          background: "rgba(201,80,76,0.06)",
          padding: "12px 20px",
          marginBottom: 24,
          fontSize: 13,
          color: "#c97a4c",
          letterSpacing: "0.02em",
        }}>
          ⚠ {error}
        </div>
      )}

      {/* Plan Gratuit — pleine largeur */}
      <div style={{
        border: "1px solid rgba(201,168,76,0.12)",
        padding: "32px 40px",
        marginBottom: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 32,
        flexWrap: "wrap",
      }}>
        <div>
          <p style={{fontFamily:"'Raleway',sans-serif", fontSize:10, letterSpacing:"0.3em", textTransform:"uppercase", color:"#6a6258", marginBottom:8}}>
            {FREE_PLAN.label}
          </p>
          <div style={{display:"flex", alignItems:"baseline", gap:6, marginBottom:8}}>
            <span style={{fontFamily:"'Cormorant Garamond',serif", fontSize:40, fontWeight:300, color:"#f5f0e8"}}>Gratuit</span>
            <span style={{fontSize:12, color:"#6a6258"}}>— inscription obligatoire</span>
          </div>
          <div style={{display:"flex", flexWrap:"wrap", gap:"8px 24px", marginTop:8}}>
            {FREE_PLAN.features.map((f,i) => (
              <span key={i} style={{fontSize:12, color:"#8a8070", display:"flex", alignItems:"center", gap:6}}>
                <span style={{color:"rgba(201,168,76,0.4)"}}>◆</span>{f}
              </span>
            ))}
            {FREE_PLAN.excluded.map((f,i) => (
              <span key={i} style={{fontSize:12, color:"#3a3830", display:"flex", alignItems:"center", gap:6}}>
                <span>—</span>{f}
              </span>
            ))}
          </div>
        </div>
        <Link href={user ? "/dashboard" : "/login"} className="btn-outline" style={{flexShrink:0, whiteSpace:"nowrap"}}>
          <span>{user ? "Mon espace →" : "Commencer gratuitement →"}</span>
        </Link>
      </div>

      {/* Plans payants — 3 colonnes */}
      <div className="pricing-grid">
        {PAID_PLANS.map(plan => (
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
          Les offres Basique et Illimité incluent l&apos;accès à Thémis — notre moteur de plaidoirie juridique.<br/>
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
