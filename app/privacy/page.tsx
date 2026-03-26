import Link from "next/link"

export default function PrivacyPage() {
  return (
    <main style={{ minHeight: "100vh", padding: "100px 48px", maxWidth: 800, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 20 }}>
          <span style={{ width: 36, height: 1, background: "linear-gradient(90deg,transparent,#c9a84c)", display: "block" }} />
          <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#6a6258" }}>Juridique</span>
          <span style={{ width: 36, height: 1, background: "linear-gradient(90deg,#c9a84c,transparent)", display: "block" }} />
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(36px,5vw,56px)", fontWeight: 300, lineHeight: 1.1, marginBottom: 16 }}>
          Politique de <em style={{ color: "#c9a84c" }}>Confidentialité</em>
        </h1>
        <p style={{ fontSize: 12, color: "#6a6258" }}>Dernière mise à jour : 26 mars 2026 — Conforme RGPD (UE 2016/679)</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>

        {/* Section 1 */}
        <div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 400, color: "#c9a84c", marginBottom: 12 }}>
            1. Responsable du Traitement
          </h2>
          <p style={{ fontSize: 14, color: "#8a8070", lineHeight: 1.9, letterSpacing: "0.02em", textAlign: "justify" }}>
            Le responsable du traitement de vos données personnelles est :<br /><br />
            <strong style={{ color: "#f5f0e8" }}>Éloquence AI</strong><br />
            Structure : Micro-entreprise<br />
            Adresse : 8 Rue Jean Pierre Timbaud, 91270 Vigneux-sur-Seine, France<br />
            Email de contact : <a href="mailto:eloquenceaii@gmail.com" style={{ color: "#c9a84c", textDecoration: "none" }}>eloquenceaii@gmail.com</a>
          </p>
        </div>

        {/* Section 2 */}
        <div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 400, color: "#c9a84c", marginBottom: 12 }}>
            2. Données Collectées
          </h2>
          <p style={{ fontSize: 14, color: "#8a8070", lineHeight: 1.9, letterSpacing: "0.02em", textAlign: "justify" }}>
            Dans le cadre de l&apos;utilisation de la plateforme Éloquence AI, nous collectons les données suivantes :
          </p>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Adresse email", detail: "Obligatoire — authentification et communications transactionnelles" },
              { label: "Prénom", detail: "Optionnel — personnalisation de l'interface" },
              { label: "Numéro de téléphone", detail: "Optionnel — fourni volontairement lors de l'inscription" },
              { label: "Fichiers audio", detail: "Traités en temps réel pour l'analyse vocale — supprimés immédiatement après traitement" },
              { label: "Historique des analyses", detail: "Résultats, scores, transcriptions — conservés selon votre forfait" },
              { label: "Données de facturation", detail: "Gérées exclusivement par Stripe (email, plan actif) — nous ne stockons aucune donnée bancaire" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "12px 16px", border: "1px solid rgba(201,168,76,0.1)", background: "rgba(18,17,26,0.4)" }}>
                <span style={{ color: "#c9a84c", flexShrink: 0, marginTop: 2 }}>✦</span>
                <div>
                  <span style={{ fontSize: 13, color: "#f5f0e8", fontFamily: "'Raleway',sans-serif" }}>{item.label}</span>
                  <span style={{ fontSize: 12, color: "#6a6258", marginLeft: 8 }}>— {item.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3 */}
        <div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 400, color: "#c9a84c", marginBottom: 12 }}>
            3. Données Audio — Politique Explicite
          </h2>
          <div style={{ padding: "20px 24px", border: "1px solid rgba(201,168,76,0.25)", background: "rgba(201,168,76,0.03)", marginBottom: 16 }}>
            <p style={{ fontSize: 14, color: "#f5f0e8", lineHeight: 1.9, letterSpacing: "0.02em", textAlign: "justify", margin: 0 }}>
              Vos enregistrements audio sont traités en temps réel pour l&apos;analyse et ne sont pas stockés sur nos serveurs après traitement. L&apos;historique de vos analyses (résultats et scores) est conservé selon la durée de votre forfait (7 jours gratuit, 30 jours Basique, illimité Illimité).
            </p>
          </div>
          <p style={{ fontSize: 14, color: "#8a8070", lineHeight: 1.9, letterSpacing: "0.02em", textAlign: "justify" }}>
            Les fichiers audio sont transmis via un canal chiffré (HTTPS) à notre service d&apos;analyse IA (Groq) hébergé sur Railway. Le traitement est instantané et aucune donnée audio brute n&apos;est conservée de manière permanente sur nos serveurs. Seuls les résultats de l&apos;analyse (scores, transcription, recommandations) peuvent être stockés dans votre historique personnel selon les durées indiquées ci-dessus.
          </p>
        </div>

        {/* Section 4 */}
        <div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 400, color: "#c9a84c", marginBottom: 12 }}>
            4. Finalités et Base Légale du Traitement
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { finalite: "Fourniture du service", base: "Exécution du contrat (Art. 6.1.b RGPD)" },
              { finalite: "Gestion des abonnements et facturation", base: "Exécution du contrat + obligation légale (Art. 6.1.b et 6.1.c RGPD)" },
              { finalite: "Envoi d'emails transactionnels", base: "Exécution du contrat (Art. 6.1.b RGPD)" },
              { finalite: "Amélioration du service (statistiques anonymisées)", base: "Intérêt légitime (Art. 6.1.f RGPD)" },
              { finalite: "Sécurité et prévention des fraudes", base: "Intérêt légitime (Art. 6.1.f RGPD)" },
            ].map((item, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, padding: "12px 16px", border: "1px solid rgba(201,168,76,0.1)", background: "rgba(18,17,26,0.4)" }}>
                <span style={{ fontSize: 13, color: "#f5f0e8", fontFamily: "'Raleway',sans-serif" }}>{item.finalite}</span>
                <span style={{ fontSize: 12, color: "#6a6258", fontStyle: "italic" }}>{item.base}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5 */}
        <div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 400, color: "#c9a84c", marginBottom: 12 }}>
            5. Sous-traitants et Destinataires
          </h2>
          <p style={{ fontSize: 14, color: "#8a8070", lineHeight: 1.9, letterSpacing: "0.02em", textAlign: "justify", marginBottom: 16 }}>
            Vos données peuvent être partagées avec les sous-traitants suivants, dans le strict cadre de la fourniture du service :
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { name: "Brevo", role: "Emails transactionnels (bienvenue, confirmation de suppression)", location: "UE" },
              { name: "Stripe", role: "Paiements sécurisés et gestion des abonnements (PCI-DSS Level 1)", location: "USA (Privacy Shield)" },
              { name: "Supabase", role: "Base de données et authentification OAuth", location: "UE (Frankfurt)" },
              { name: "Vercel", role: "Hébergement frontend", location: "USA (DPA)" },
              { name: "Railway", role: "Hébergement backend API et traitement IA", location: "USA (DPA)" },
              { name: "Groq", role: "Analyse IA des enregistrements vocaux et textes", location: "USA (DPA)" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: "14px 18px", border: "1px solid rgba(201,168,76,0.1)", background: "rgba(18,17,26,0.4)" }}>
                <span style={{ color: "#c9a84c", flexShrink: 0, marginTop: 2 }}>✦</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontFamily: "'Raleway',sans-serif", color: "#f5f0e8", fontWeight: 500 }}>{item.name}</span>
                  <span style={{ fontSize: 12, color: "#6a6258", marginLeft: 8 }}>— {item.role}</span>
                </div>
                <span style={{ fontSize: 10, color: "#6a6258", letterSpacing: "0.1em", textTransform: "uppercase" as const, flexShrink: 0 }}>{item.location}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "#6a6258", marginTop: 16, fontStyle: "italic" }}>
            Aucun autre tiers n&apos;a accès à vos données personnelles.
          </p>
        </div>

        {/* Section 6 */}
        <div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 400, color: "#c9a84c", marginBottom: 12 }}>
            6. Durées de Conservation
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { data: "Données de compte (email, prénom)", duration: "Jusqu'à suppression du compte" },
              { data: "Fichiers audio bruts", duration: "Supprimés immédiatement après traitement" },
              { data: "Historique des analyses — Forfait Gratuit", duration: "7 jours" },
              { data: "Historique des analyses — Forfait Basique", duration: "30 jours" },
              { data: "Historique des analyses — Forfait Illimité", duration: "Illimité (jusqu'à suppression du compte)" },
              { data: "Données de facturation (Stripe)", duration: "6 ans (obligation légale France — Code du Commerce)" },
            ].map((item, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, padding: "12px 16px", border: "1px solid rgba(201,168,76,0.1)", background: "rgba(18,17,26,0.4)" }}>
                <span style={{ fontSize: 13, color: "#f5f0e8", fontFamily: "'Raleway',sans-serif" }}>{item.data}</span>
                <span style={{ fontSize: 12, color: "#6a6258" }}>{item.duration}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "#6a6258", marginTop: 16, fontStyle: "italic", textAlign: "justify" }}>
            Note : Les données de facturation (factures Stripe) sont conservées 6 ans même en cas de suppression de compte, conformément aux obligations fiscales et comptables françaises. Elles ne peuvent pas être supprimées à votre demande.
          </p>
        </div>

        {/* Section 7 */}
        <div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 400, color: "#c9a84c", marginBottom: 12 }}>
            7. Vos Droits RGPD
          </h2>
          <p style={{ fontSize: 14, color: "#8a8070", lineHeight: 1.9, letterSpacing: "0.02em", textAlign: "justify", marginBottom: 16 }}>
            Conformément au RGPD (UE 2016/679), vous disposez des droits suivants sur vos données personnelles :
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { right: "Droit d'accès (Art. 15)", desc: "Obtenir une copie de toutes vos données personnelles que nous détenons" },
              { right: "Droit de rectification (Art. 16)", desc: "Corriger des données inexactes ou incomplètes" },
              { right: "Droit à l'effacement / Oubli (Art. 17)", desc: "Supprimer l'intégralité de votre compte et de vos données" },
              { right: "Droit à la portabilité (Art. 20)", desc: "Recevoir vos données dans un format structuré et lisible par machine" },
              { right: "Droit d'opposition (Art. 21)", desc: "Vous opposer au traitement de vos données à des fins de marketing" },
              { right: "Droit à la limitation (Art. 18)", desc: "Demander la suspension temporaire du traitement de vos données" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "12px 16px", border: "1px solid rgba(201,168,76,0.1)", background: "rgba(18,17,26,0.4)" }}>
                <span style={{ color: "#c9a84c", flexShrink: 0, marginTop: 2 }}>✦</span>
                <div>
                  <span style={{ fontSize: 13, color: "#f5f0e8", fontFamily: "'Raleway',sans-serif", fontWeight: 500 }}>{item.right}</span>
                  <span style={{ fontSize: 12, color: "#6a6258", marginLeft: 8 }}>— {item.desc}</span>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 14, color: "#8a8070", lineHeight: 1.9, letterSpacing: "0.02em", textAlign: "justify", marginTop: 16 }}>
            Pour exercer ces droits, contactez-nous à : <a href="mailto:eloquenceaii@gmail.com" style={{ color: "#c9a84c", textDecoration: "none" }}>eloquenceaii@gmail.com</a>. Nous nous engageons à répondre dans un délai maximum de 30 jours. Vous disposez également du droit d&apos;introduire une réclamation auprès de la <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: "#c9a84c", textDecoration: "none" }}>CNIL</a> (Commission Nationale de l&apos;Informatique et des Libertés).
          </p>
        </div>

        {/* Section 8 */}
        <div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 400, color: "#c9a84c", marginBottom: 12 }}>
            8. Droit à l&apos;Oubli — Procédure de Suppression (Art. 17 RGPD)
          </h2>
          <p style={{ fontSize: 14, color: "#8a8070", lineHeight: 1.9, letterSpacing: "0.02em", textAlign: "justify", marginBottom: 16 }}>
            Vous pouvez demander la suppression complète de votre compte et de toutes vos données personnelles à tout moment. Voici la procédure et ce qui est supprimé :
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: "#c9a84c", letterSpacing: "0.2em", textTransform: "uppercase" as const, fontFamily: "'Raleway',sans-serif" }}>
              Via votre espace personnel (recommandé)
            </p>
            {[
              "Connectez-vous à votre compte",
              "Accédez à votre tableau de bord → onglet « Sécurité »",
              "Cliquez sur « Supprimer définitivement mon compte »",
              "Confirmez avec votre mot de passe",
              "La suppression est immédiate et irréversible",
            ].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 16, padding: "10px 16px", border: "1px solid rgba(201,168,76,0.1)", background: "rgba(18,17,26,0.4)", alignItems: "center" }}>
                <span style={{ color: "#c9a84c", fontSize: 11, fontFamily: "'Raleway',sans-serif", fontWeight: 500, flexShrink: 0, width: 20 }}>{i + 1}.</span>
                <span style={{ fontSize: 13, color: "#f5f0e8" }}>{step}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 14, color: "#8a8070", lineHeight: 1.9, letterSpacing: "0.02em", textAlign: "justify", marginBottom: 12 }}>
            <strong style={{ color: "#f5f0e8" }}>Ce qui est supprimé :</strong> profil utilisateur, historique des analyses, données audio (déjà supprimées après traitement), contact Brevo, compte d&apos;authentification Supabase.
          </p>
          <p style={{ fontSize: 14, color: "#8a8070", lineHeight: 1.9, letterSpacing: "0.02em", textAlign: "justify" }}>
            <strong style={{ color: "#f5f0e8" }}>Ce qui n&apos;est pas supprimé :</strong> les factures Stripe, conservées 6 ans conformément aux obligations légales françaises (Code du Commerce, art. L123-22). Elles ne contiennent que votre email et l&apos;historique de vos abonnements.
          </p>
          <p style={{ fontSize: 14, color: "#8a8070", lineHeight: 1.9, letterSpacing: "0.02em", textAlign: "justify", marginTop: 12 }}>
            Vous pouvez également envoyer votre demande par email à <a href="mailto:eloquenceaii@gmail.com" style={{ color: "#c9a84c", textDecoration: "none" }}>eloquenceaii@gmail.com</a>.
          </p>
        </div>

        {/* Section 9 */}
        <div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 400, color: "#c9a84c", marginBottom: 12 }}>
            9. Cookies et Traceurs
          </h2>
          <p style={{ fontSize: 14, color: "#8a8070", lineHeight: 1.9, letterSpacing: "0.02em", textAlign: "justify" }}>
            Nous utilisons uniquement les cookies strictement nécessaires au fonctionnement du service :
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
            {[
              { type: "Cookies de session Supabase", purpose: "Authentification — obligatoires pour l'accès au service", required: true },
              { type: "Cookies Stripe", purpose: "Traitement sécurisé des paiements — obligatoires pour les abonnements", required: true },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", border: "1px solid rgba(201,168,76,0.1)", background: "rgba(18,17,26,0.4)" }}>
                <span style={{ color: "#c9a84c", flexShrink: 0, marginTop: 2 }}>✦</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, color: "#f5f0e8", fontFamily: "'Raleway',sans-serif" }}>{item.type}</span>
                  <span style={{ fontSize: 12, color: "#6a6258", marginLeft: 8 }}>— {item.purpose}</span>
                </div>
                {item.required && (
                  <span style={{ fontSize: 9, color: "#c9a84c", letterSpacing: "0.15em", textTransform: "uppercase" as const, flexShrink: 0 }}>Obligatoire</span>
                )}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 14, color: "#8a8070", lineHeight: 1.9, letterSpacing: "0.02em", textAlign: "justify", marginTop: 16 }}>
            Nous n&apos;utilisons pas de cookies publicitaires ou de suivi comportemental tiers. Le refus des cookies essentiels empêchera l&apos;accès au service d&apos;authentification.
          </p>
        </div>

        {/* Section 10 */}
        <div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 400, color: "#c9a84c", marginBottom: 12 }}>
            10. Sécurité des Données
          </h2>
          <p style={{ fontSize: 14, color: "#8a8070", lineHeight: 1.9, letterSpacing: "0.02em", textAlign: "justify" }}>
            Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données personnelles contre tout accès non autorisé, perte, destruction ou divulgation. Ces mesures comprennent notamment : le chiffrement des communications (HTTPS/TLS), l&apos;authentification sécurisée via Supabase, la gestion des paiements conforme PCI-DSS Level 1 par Stripe, et l&apos;accès restreint aux données aux seules personnes habilitées.
          </p>
        </div>

        {/* Section 11 */}
        <div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 400, color: "#c9a84c", marginBottom: 12 }}>
            11. Modifications de la Politique
          </h2>
          <p style={{ fontSize: 14, color: "#8a8070", lineHeight: 1.9, letterSpacing: "0.02em", textAlign: "justify" }}>
            Nous nous réservons le droit de modifier la présente Politique de Confidentialité à tout moment. Toute modification substantielle vous sera notifiée par email au moins 15 jours avant son entrée en vigueur. La date de dernière mise à jour est indiquée en haut de cette page.
          </p>
        </div>

        {/* Section 12 */}
        <div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 400, color: "#c9a84c", marginBottom: 12 }}>
            12. Contact — Délégué à la Protection des Données (DPO)
          </h2>
          <p style={{ fontSize: 14, color: "#8a8070", lineHeight: 1.9, letterSpacing: "0.02em", textAlign: "justify" }}>
            Pour toute question relative à la protection de vos données personnelles ou pour exercer vos droits, contactez notre référent RGPD :<br /><br />
            <strong style={{ color: "#f5f0e8" }}>Éloquence AI — Référent RGPD</strong><br />
            Email : <a href="mailto:eloquenceaii@gmail.com" style={{ color: "#c9a84c", textDecoration: "none" }}>eloquenceaii@gmail.com</a><br />
            Adresse : 8 Rue Jean Pierre Timbaud, 91270 Vigneux-sur-Seine, France<br /><br />
            En cas de réponse insatisfaisante, vous pouvez saisir la <a href="https://www.cnil.fr/fr/vous-souhaitez-contacter-la-cnil" target="_blank" rel="noopener noreferrer" style={{ color: "#c9a84c", textDecoration: "none" }}>CNIL</a> (Commission Nationale de l&apos;Informatique et des Libertés), 3 Place de Fontenoy, 75007 Paris.
          </p>
        </div>

      </div>

      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 32, marginTop: 64, paddingTop: 40, borderTop: "1px solid rgba(201,168,76,0.08)" }}>
        <Link href="/" style={{ fontSize: 11, color: "#6a6258", letterSpacing: "0.1em", textDecoration: "none" }}>Accueil →</Link>
        <Link href="/cguv" style={{ fontSize: 11, color: "#6a6258", letterSpacing: "0.1em", textDecoration: "none" }}>CGUV →</Link>
        <Link href="/faq" style={{ fontSize: 11, color: "#6a6258", letterSpacing: "0.1em", textDecoration: "none" }}>FAQ →</Link>
        <Link href="/mentions-legales" style={{ fontSize: 11, color: "#6a6258", letterSpacing: "0.1em", textDecoration: "none" }}>Mentions légales →</Link>
      </div>
    </main>
  )
}
