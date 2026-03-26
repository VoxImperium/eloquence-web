"use client"
import Link from "next/link"
import { useState } from "react"

const FAQ_ITEMS = [
  {
    q: "Comment fonctionne l'analyse vocale ?",
    a: "Éloquence AI analyse votre enregistrement audio grâce à notre moteur d'intelligence artificielle. Il évalue votre débit, votre intonation, vos silences, votre clarté d'expression et vous fournit un rapport détaillé avec des axes d'amélioration personnalisés."
  },
  {
    q: "Quels sont les forfaits disponibles ?",
    a: "Nous proposons 3 forfaits : Gratuit (0€ — 2 analyses/mois), Basique à 7,99€/mois (10 analyses/mois, accès à Thémis), et Illimité à 15,99€/mois (tout illimité + Export PDF)."
  },
  {
    q: "Comment résilier mon abonnement ?",
    a: "Vous pouvez résilier votre abonnement à tout moment depuis votre espace personnel, sans frais ni engagement. L'accès reste actif jusqu'à la fin de la période facturée."
  },
  {
    q: "Comment fonctionne Thémis, le moteur de plaidoirie juridique ?",
    a: "Thémis est notre assistant spécialisé en droit français. Il vous permet de vous entraîner à la plaidoirie, d'analyser des cas pratiques juridiques et de rechercher de la jurisprudence dans les bases de données officielles (Légifrance, Cour de cassation)."
  },
  {
    q: "Mes données audio sont-elles conservées ?",
    a: "Vos enregistrements audio sont traités en temps réel pour l'analyse et ne sont pas stockés sur nos serveurs après traitement. L'historique de vos analyses (résultats et scores) est conservé selon la durée de votre forfait (7 jours gratuit, 30 jours Basique, illimité Illimité)."
  },
  {
    q: "Comment contacter le support ?",
    a: "Vous pouvez nous contacter par email à eloquenceaii@gmail.com. Nous répondons généralement dans les 24 à 48 heures ouvrées."
  },
  {
    q: "Le paiement est-il sécurisé ?",
    a: "Oui, tous les paiements sont sécurisés par Stripe, leader mondial du paiement en ligne. Nous ne stockons aucune information bancaire sur nos serveurs."
  },
  {
    q: "Puis-je supprimer mon compte et toutes mes données ?",
    a: "Oui, vous disposez du droit à l'oubli selon le RGPD (Article 17). Vous pouvez supprimer votre compte et toutes vos données (profil, analyses, historiques) à tout moment depuis votre tableau de bord, onglet Sécurité. Vos enregistrements audio sont supprimés immédiatement après chaque analyse. Les factures restent conservées 6 ans pour conformité fiscale française. Pour toute demande supplémentaire, contactez eloquenceaii@gmail.com."
  },
]

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <main style={{ minHeight: "100vh", padding: "100px 48px", maxWidth: 800, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 20 }}>
          <span style={{ width: 36, height: 1, background: "linear-gradient(90deg,transparent,#c9a84c)", display: "block" }} />
          <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#6a6258" }}>Support</span>
          <span style={{ width: 36, height: 1, background: "linear-gradient(90deg,#c9a84c,transparent)", display: "block" }} />
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(36px,5vw,56px)", fontWeight: 300, lineHeight: 1.1, marginBottom: 16 }}>
          Questions <em style={{ color: "#c9a84c" }}>fréquentes</em>
        </h1>
        <p style={{ fontSize: 13, color: "#6a6258", lineHeight: 1.8 }}>
          Tout ce que vous devez savoir sur Éloquence AI.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} style={{ borderTop: "1px solid rgba(201,168,76,0.12)" }}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{
                width: "100%", textAlign: "left", background: "none", border: "none",
                padding: "24px 0", cursor: "pointer",
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16,
              }}
            >
              <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 300, color: "#f5f0e8", lineHeight: 1.3 }}>
                {item.q}
              </span>
              <span style={{ color: "#c9a84c", fontSize: 20, flexShrink: 0, transform: open === i ? "rotate(45deg)" : "none", transition: "transform 0.2s" }}>✦</span>
            </button>
            {open === i && (
              <p style={{ fontSize: 14, color: "#8a8070", lineHeight: 1.8, paddingBottom: 24, paddingRight: 32, letterSpacing: "0.02em" }}>
                {item.a}
              </p>
            )}
          </div>
        ))}
        <div style={{ borderTop: "1px solid rgba(201,168,76,0.12)" }} />
      </div>

      <div style={{ textAlign: "center", marginTop: 64, paddingTop: 48, borderTop: "1px solid rgba(201,168,76,0.08)" }}>
        <p style={{ fontSize: 13, color: "#6a6258", marginBottom: 24, lineHeight: 1.7 }}>
          Vous ne trouvez pas la réponse à votre question ?
        </p>
        <a href="mailto:eloquenceaii@gmail.com" style={{ fontSize: 12, color: "#c9a84c", letterSpacing: "0.1em", textDecoration: "none", fontFamily: "'Raleway',sans-serif" }}>
          Nous contacter →
        </a>
      </div>

      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 32, marginTop: 48 }}>
        <Link href="/" style={{ fontSize: 11, color: "#6a6258", letterSpacing: "0.1em", textDecoration: "none" }}>Accueil →</Link>
        <Link href="/cguv" style={{ fontSize: 11, color: "#6a6258", letterSpacing: "0.1em", textDecoration: "none" }}>CGUV →</Link>
        <Link href="/privacy" style={{ fontSize: 11, color: "#6a6258", letterSpacing: "0.1em", textDecoration: "none" }}>Confidentialité →</Link>
        <Link href="/mentions-legales" style={{ fontSize: 11, color: "#6a6258", letterSpacing: "0.1em", textDecoration: "none" }}>Mentions légales →</Link>
      </div>
    </main>
  )
}
