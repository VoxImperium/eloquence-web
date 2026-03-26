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
          Conditions Générales <em style={{ color: "#c9a84c" }}>d&apos;Utilisation et de Vente</em>
        </h1>
        <p style={{ fontSize: 12, color: "#6a6258" }}>Dernière mise à jour : 26 mars 2026</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
        {[
          {
            title: "1. Objet et Acceptation",
            content: "Les présentes CGUV régissent l'accès et l'utilisation de la plateforme Éloquence AI, accessible à l'adresse www.eloquence.fr. En créant un compte, l'utilisateur reconnaît avoir pris connaissance des présentes et les accepte sans réserve."
          },
          {
            title: "2. Accès et Sécurité du Compte",
            content: "L'accès nécessite la création d'un compte avec une adresse email valide. L'utilisateur est seul responsable de la confidentialité de ses identifiants. Éloquence AI se réserve le droit de suspendre tout compte en cas d'utilisation frauduleuse, de partage d'identifiants ou de comportement contraire aux présentes."
          },
          {
            title: "3. Conditions Financières et Abonnements",
            content: "La plateforme propose deux formules d'abonnement : Forfait Basique à 7,99 € / mois (accès limité selon les quotas indiqués sur le site) et Forfait Illimité à 15,99 € / mois (accès sans restriction aux outils d'analyse). Les tarifs sont indiqués en euros TTC. Le règlement s'effectue via le prestataire sécurisé Stripe. Les abonnements sont sans engagement et résiliables à tout moment via l'espace personnel. Toute période mensuelle entamée est due ; aucun remboursement ne sera effectué pour le mois en cours."
          },
          {
            title: "4. Droit de Rétractation (Service Numérique)",
            content: "Conformément à l'article L221-28 du Code de la consommation, l'utilisateur accepte expressément que l'exécution du service commence immédiatement après le paiement. En conséquence, il renonce expressément à son droit de rétractation de 14 jours pour bénéficier de l'accès instantané aux outils d'IA."
          },
          {
            title: "5. Propriété Intellectuelle",
            content: "La Plateforme : Les algorithmes, le code source, l'interface, les logos et la marque « Éloquence AI » sont la propriété exclusive de l'éditeur. Les Outputs (Résultats) : Éloquence AI concède à l'utilisateur une licence mondiale et non-exclusive d'utiliser les textes, analyses et suggestions générés par l'IA pour ses propres besoins. L'utilisateur reste seul propriétaire de ses discours originaux."
          },
          {
            title: "6. Limitation de Responsabilité et Nature du Service",
            content: "Assistance technique : Éloquence AI est un outil d'entraînement basé sur l'intelligence artificielle. Il peut comporter des erreurs ou des approximations. Absence de conseil juridique : L'outil ne constitue en aucun cas un conseil juridique ou professionnel. Éloquence AI n'est pas un cabinet d'avocats. L'utilisateur est seul responsable de la vérification de la véracité des propos suggérés. Responsabilité : L'éditeur ne pourra être tenu responsable d'un échec (concours, procès, examen) résultant de l'utilisation des recommandations de l'IA."
          },
          {
            title: "7. Protection des Données et RGPD",
            content: "Données : Email, prénom et enregistrements audio. Données Audio : Les fichiers audio sont traités pour l'analyse et supprimés de nos serveurs immédiatement après le traitement, sauf si l'utilisateur choisit explicitement de les sauvegarder dans son historique personnel. Droits : Vous disposez d'un droit d'accès, de rectification et de suppression via eloquenceaii@gmail.com."
          },
          {
            title: "8. Disponibilité et Force Majeure",
            content: "Éloquence AI s'efforce d'assurer une disponibilité 24h/24. Toutefois, l'accès peut être suspendu pour maintenance technique ou défaillance des serveurs tiers. Aucune indemnité ne sera due."
          },
          {
            title: "9. Droit Applicable et Litiges",
            content: "Les présentes sont soumises au droit français. En cas de litige, une solution amiable sera recherchée avant toute action devant les tribunaux compétents."
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
