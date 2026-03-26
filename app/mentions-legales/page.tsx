import Link from "next/link"

export default function MentionsLegalesPage() {
  return (
    <main style={{ minHeight: "100vh", padding: "100px 48px", maxWidth: 800, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 20 }}>
          <span style={{ width: 36, height: 1, background: "linear-gradient(90deg,transparent,#c9a84c)", display: "block" }} />
          <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#6a6258" }}>Juridique</span>
          <span style={{ width: 36, height: 1, background: "linear-gradient(90deg,#c9a84c,transparent)", display: "block" }} />
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(36px,5vw,56px)", fontWeight: 300, lineHeight: 1.1, marginBottom: 16 }}>
          Mentions <em style={{ color: "#c9a84c" }}>légales</em>
        </h1>
        <p style={{ fontSize: 12, color: "#6a6258" }}>Conformément à la loi n°2004-575 du 21 juin 2004 pour la Confiance dans l&apos;Économie Numérique</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
        {[
          {
            title: "Éditeur du site",
            content: [
              "Dénomination : Éloquence AI",
              "Site web : www.éloquence.fr",
              "Email : eloquenceaii@gmail.com",
              "Directeur de la publication : Éloquence AI",
            ]
          },
          {
            title: "Hébergement",
            content: [
              "Hébergeur : Vercel Inc.",
              "Adresse : 340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis",
              "Site web : vercel.com",
            ]
          },
          {
            title: "Propriété intellectuelle",
            content: [
              "L'ensemble des contenus de ce site (textes, images, graphismes, logo, icônes, sons, logiciels) est la propriété exclusive d'Éloquence AI, à l'exception des marques, logos ou contenus appartenant à d'autres sociétés partenaires ou auteurs.",
              "Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable d'Éloquence AI.",
              "© 2025-2026 Éloquence AI — Tous droits réservés.",
            ]
          },
          {
            title: "Données personnelles & RGPD",
            content: [
              "Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez des droits suivants sur vos données personnelles :",
              "• Droit d'accès à vos données",
              "• Droit de rectification",
              "• Droit à l'effacement (droit à l'oubli)",
              "• Droit à la portabilité",
              "• Droit d'opposition au traitement",
              "Pour exercer ces droits, contactez-nous à : eloquenceaii@gmail.com",
            ]
          },
          {
            title: "Cookies",
            content: [
              "Ce site utilise des cookies techniques nécessaires à son fonctionnement (authentification, préférences) ainsi que des cookies analytiques anonymisés pour améliorer l'expérience utilisateur.",
              "Vous pouvez désactiver les cookies dans les paramètres de votre navigateur, ce qui peut affecter certaines fonctionnalités du site.",
            ]
          },
          {
            title: "Liens hypertextes",
            content: [
              "Le site www.éloquence.fr peut contenir des liens vers d'autres sites. Éloquence AI n'est pas responsable du contenu de ces sites externes et ne peut être tenu responsable des dommages résultant de leur consultation.",
            ]
          },
          {
            title: "Droit applicable",
            content: [
              "Tout litige en relation avec l'utilisation du site www.éloquence.fr est soumis au droit français. Il est fait attribution exclusive de juridiction aux tribunaux compétents de France.",
            ]
          },
        ].map((section, i) => (
          <div key={i}>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 400, color: "#c9a84c", marginBottom: 16 }}>
              {section.title}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {section.content.map((line, j) => (
                <p key={j} style={{ fontSize: 14, color: "#8a8070", lineHeight: 1.9, letterSpacing: "0.02em" }}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 32, marginTop: 64, paddingTop: 40, borderTop: "1px solid rgba(201,168,76,0.08)" }}>
        <Link href="/" style={{ fontSize: 11, color: "#6a6258", letterSpacing: "0.1em", textDecoration: "none" }}>Accueil →</Link>
        <Link href="/faq" style={{ fontSize: 11, color: "#6a6258", letterSpacing: "0.1em", textDecoration: "none" }}>FAQ →</Link>
        <Link href="/cguv" style={{ fontSize: 11, color: "#6a6258", letterSpacing: "0.1em", textDecoration: "none" }}>CGUV →</Link>
        <Link href="/privacy" style={{ fontSize: 11, color: "#6a6258", letterSpacing: "0.1em", textDecoration: "none" }}>Confidentialité →</Link>
      </div>
    </main>
  )
}
