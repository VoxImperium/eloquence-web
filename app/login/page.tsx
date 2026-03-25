use client
import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"

const QUOTES = [
  { text:"La parole est à moitié à celui qui parle, à moitié à celui qui écoute.", author:"Michel de Montaigne" },
  { text:"Speak clearly, if you speak at all; carve every word before you let it fall.", author:"Oliver W. Holmes" },
  { text:"La vraie éloquence consiste à dire tout ce qu'il faut, et à ne dire que ce qu'il faut.", author:"La Rochefoucauld" },
]

export default function LoginPage() {
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [mode,     setMode]     = useState("login")
  const [error,    setError]    = useState("")
  const [loading,  setLoading]  = useState(false)
  const router   = useRouter()

  const handleSubmit = async () => {
    setError(""); setLoading(true)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || supabaseUrl.includes("placeholder") || !supabaseKey || supabaseKey.includes("placeholder")) {
      setError("Configuration manquante. Veuillez contacter le support.")
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push("/dashboard")
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        // Email de bienvenue — fire-and-forget, ne bloque pas la navigation
        fetch("/api/backend/emails/welcome", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            email: data.user?.email || "",
            prenom: data.user?.user_metadata?.full_name || "",
            plan: "free"
          })
        }).catch(() => {})
        router.push("/dashboard")
      }
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const q = QUOTES[Math.floor(Date.now() / 10000) % QUOTES.length]

  return (
    <main style={{
      minHeight:"100vh",
      display:"grid", gridTemplateColumns:"1fr 1fr",
    }}>
      {/* Côté gauche — formulaire */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"80px 64px",
        borderRight:"1px solid rgba(201,168,76,0.15)",
      }}>
        <div style={{width:"100%, maxWidth:380}}>

          {/* Logo */}
          <Link href="/" style={{display:"flex", alignItems:"center", gap:12, textDecoration:"none", marginBottom:56}}>
            <div style={{width:32, height:32, border:"1px solid rgba(201,168,76,0.5)", display:"flex", alignItems:"center", justifyContent:"center"}}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="7" y="1" width="4" height="8" rx="2" fill="#c9a84c"/>
                <path d="M3 9 Q3 13 9 13 Q15 13 15 9" stroke="#c9a84c" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
                <line x1="9" y1="13" x2="9" y2="17" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round"/>
                <line x1="5" y1="17" x2="13" y2="17" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            <span style={{fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:300, letterSpacing:"0.1em", color:"#f5f0e8"}}>Éloquence<span style={{color:"#c9a84c", fontStyle:"italic"}}>.ai</span></span>
          </Link>

          <p className="ornament" style={{marginBottom:24}}>✦</p>

          <h1 style={{fontFamily:"'Cormorant Garamond',serif", fontSize:36, fontWeight:300, marginBottom:8}}>
            {mode === "login" ? "Bon retour" : "Rejoignez-nous"}
          </h1>
          <p style={{fontSize:12, color:"#6a6258", marginBottom:40, letterSpacing:"0.04em"}}>
            {mode === "login" ? "Pas encore membre ?" : "Déjà un compte ?"} {" "}
            <button onClick={() => setMode(mode === "login" ? "signup" : "login")}
              style={{color:"#c9a84c", background:"none", border:"none", cursor:"pointer", fontSize:12, fontFamily:"'Raleway',sans-serif", letterSpacing:"0.04em", textDecoration:"underline"}}>
              {mode === "login" ? "Créer un compte" : "Se connecter"}
            </button>
          </p>

          <div style={{marginBottom:28}}>
            <label className="label-oratoire">Adresse électronique</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="input-oratoire" placeholder="votre@email.com"/>
          </div>

          <div style={{marginBottom:36}}>
            <label className="label-oratoire">Mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="input-oratoire" placeholder="••••••••••"
              onKeyDown={e => e.key === "Enter" && handleSubmit()}/>
          </div>

          {error && (
            <div style={{padding:"12px 16px", border:"1px solid rgba(255,100,100,0.2)", background:"rgba(255,100,100,0.05)", marginBottom:24}}>
              <p style={{fontSize:12, color:"#ff8080", letterSpacing:"0.03em"}}>{error}</p>
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading} className="btn-gold" style={{width:"100%", justifyContent:"center"}}>
            {loading ? <><span className="spinner-gold"/><span className="btn-text">Connexion en cours...</span></> : <span className="btn-text">{mode === "login" ? "Accéder à mon espace" : "Créer mon compte"}</span>}
          </button>

          <div style={{display:"flex", alignItems:"center", gap:16, margin:"28px 0"}}>
            <div style={{flex:1, height:1, background:"rgba(201,168,76,0.12)"}}/>
            <span style={{fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:"#6a6258"}}>ou</span>
            <div style={{flex:1, height:1, background:"rgba(201,168,76,0.12)"}}/>
          </div>

          <p style={{textAlign:"center", fontSize:11, color:"#6a6258", letterSpacing:"0.04em"}}
            >En continuant, vous acceptez nos {" "}
            <Link href="#" style={{color:"#c9a84c", textDecoration:"none"}}>conditions d&apos;utilisation</Link>
          </p>

        </div>
      </div>

      {/* Côté droit — citation + ambiance */}
      <div style={{
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        padding:"80px 64px",
        background:"rgba(12,11,18,0.6)",
        position:"relative", overflow:"hidden",
      }}>
        <div style={{position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 60% at 50% 50%, rgba(201,168,76,0.04) 0%, transparent 70%)"}}/>
        <div style={{position:"relative", maxWidth:380, textAlign:"center"}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif", fontSize:96, lineHeight:0.6, color:"rgba(201,168,76,0.15)", marginBottom:8, fontWeight:300}}>&ldquo;</div>
          <p style={{fontFamily:"'Cormorant Garamond',serif", fontSize:24, fontStyle:"italic", fontWeight:300, lineHeight:1.65, color:"#f5f0e8", marginBottom:24}}>
            {q.text}
          </p>
          <p style={{fontSize:10, letterSpacing:"0.3em", textTransform:"uppercase", color:"#c9a84c", marginBottom:56}}>— {q.author}</p>
          <div className="rule-gold" style={{margin:"0 auto", width:60}}/>
        </div>
      </div>
    </main>
  )
}