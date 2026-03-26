import Link from "next/link"

export default function CGUPage() {
  return (
    <main style={{ minHeight: "100vh", padding: "100px 48px", maxWidth: 800, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 20 }}>
          <span style={{ width: 36, height: 1, background: "linear-gradient(90deg,transparent,#c9a84c)", display: "block" }} />
          <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#6a6258" }}>Juridique</span>
          <span style={{ width: 36, height: 1, background: "linear-gradient(90deg,#c9a84c,transparent)", display: "block" }} />
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(36px,5vw,56px)", fontWeight: 300, lineHeight: 1.1, marginBottom: 16 }}>
          Conditions Générales <em style={{ color: "#c9a84c" }}>d&apos;Utilisation</em>
        </h1>
        <p style={{ fontSize: 12, color: "#6a6258" }}>Dernière mise à jour : mars 2026</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
        {[
          {
            title: "1. Objet",
            content: "Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme Éloquence AI, accessible à l'adresse www.éloquence.fr, éditée par Éloquence AI. En créant un compte ou en utilisant nos services, vous acceptez sans réserve les présentes CGU."
          },
          {
            title: "2. Accès au service",
            content: "L'accès à la plateforme nécessite la création d'un compte avec une adresse email valide. L'utilisateur s'engage à fournir des informations exactes et à maintenir la confidentialité de ses identifiants. Éloquence AI se réserve le droit de suspendre ou supprimer tout compte en cas d'utilisation frauduleuse ou contraire aux présentes CGU."
          },
          {
            title: "3. Forfaits et abonnements",
            content: "La plateforme propose un accès gratuit limité et des abonnements payants (Basique à 7,99€/mois, Illimité à 15,99€/mois). Les abonnements sont sans engagement et résiliables à tout moment depuis l'espace personnel. Le paiement est effectué mensuellement via Stripe. Aucun remboursement ne sera effectué pour la période en cours au moment de la résiliation."
          },
          {
            title: "4. Utilisation acceptable",
            content: "L'utilisateur s'engage à utiliser la plateforme Éloquence AI dans le respect des lois en vigueur et des présentes CGU. Il est interdit d'utiliser la plateforme à des fins illicites, de tenter d'en compromettre la sécurité ou d'en perturber le fonctionnement. Tout usage abusif pourra entraîner la suspension immédiate du compte."
          },
          {
            title: "5. Propriété intellectuelle",
            content: "L'ensemble des contenus présents sur la plateforme Éloquence AI (textes, images, algorithmes, code source, interface graphique, marque) est la propriété exclusive d'Éloquence AI et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle. Toute reproduction, même partielle, est strictement interdite sans autorisation écrite préalable."
          },
          {
            title: "6. Données personnelles",
            content: "Éloquence AI collecte et traite des données personnelles conformément au Règlement Général sur la Protection des Données (RGPD). Les données collectées (email, prénom, numéro de téléphone optionnel, enregistrements audio temporaires) sont utilisées uniquement pour la fourniture du service. Elles ne sont jamais revendues à des tiers. Vous disposez d'un droit d'accès, de rectification et de suppression de vos données en nous contactant à eloquenceaii@gmail.com."
          },
          {
            title: "7. Données audio",
            content: "Les enregistrements audio transmis pour analyse sont traités en temps réel et ne sont pas stockés de manière permanente sur nos serveurs. Seuls les résultats d'analyse (scores, recommandations) sont conservés selon la durée prévue par votre forfait."
          },
          {
            title: "8. Limitation de responsabilité",
            content: "Éloquence AI est un outil d'entraînement et d'amélioration oratoire. Les analyses et recommandations fournies sont indicatives et ne constituent pas un avis professionnel (médical, juridique ou autre). Éloquence AI ne saurait être tenu responsable des décisions prises sur la base des analyses produites par la plateforme."
          },
          {
            title: "9. Disponibilité du service",
            content: "Éloquence AI s'efforce d'assurer une disponibilité maximale de la plateforme mais ne peut garantir un accès ininterrompu. Des interruptions pour maintenance ou en cas de force majeure peuvent survenir. Aucune indemnisation ne sera versée pour ces interruptions."
          },
          {
            title: "10. Modification des CGU",
            content: "Éloquence AI se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés par email de toute modification substantielle. La poursuite de l'utilisation du service après notification vaut acceptation des nouvelles CGU."
          },
          {
            title: "11. Droit applicable",
            content: "Les présentes CGU sont soumises au droit français. En cas de litige, et après tentative de résolution amiable, les tribunaux français seront seuls compétents."
          },
          {
            title: "12. Contact",
            content: "Pour toute question relative aux présentes CGU : eloquenceaii@gmail.com"
          },
        ].map((section, i) => (
          <div key={i}>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 400, color: "#c9a84c", marginBottom: 12 }}>
              {section.title}
            </h2>
            <p style={{ fontSize: 14, color: "#8a8070", lineHeight: 1.9, letterSpacing: "0.02em" }}>
              {section.content}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 32, marginTop: 64, paddingTop: 40, borderTop: "1px solid rgba(201,168,76,0.08)" }}>
        <Link href="/" style={{ fontSize: 11, color: "#6a6258", letterSpacing: "0.1em", textDecoration: "none" }}>Accueil →</Link>
        <Link href="/faq" style={{ fontSize: 11, color: "#6a6258", letterSpacing: "0.1em", textDecoration: "none" }}>FAQ →</Link>
        <Link href="/mentions-legales" style={{ fontSize: 11, color: "#6a6258", letterSpacing: "0.1em", textDecoration: "none" }}>Mentions légales →</Link>
      </div>
    </main>
  )
}
