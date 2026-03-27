import type { Metadata } from "next"
import "./globals.css"
import Nav from "@/components/Nav"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Éloquence.ai — L'art oratoire sublimé par l'intelligence artificielle",
  description: "Analyse vocale, joute verbale, entraînement socratique, réécriture oratoire et cas pratiques juridiques. Pour les orateurs d'exception.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Raleway:wght@200;300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Nav />
        <div className="pt-16">{children}</div>
        <footer style={{
          borderTop: "1px solid rgba(201,168,76,0.08)",
          padding: "24px 48px",
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "28px",
          marginTop: 40,
        }}>
          {[
            { href: "/privacy", label: "Politique de Confidentialité" },
            { href: "/cguv", label: "CGUV" },
            { href: "/mentions-legales", label: "Mentions légales" },
            { href: "/faq", label: "FAQ" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{ fontSize: 10, color: "#6a6258", letterSpacing: "0.1em", textDecoration: "none", fontFamily: "'Raleway',sans-serif", textTransform: "uppercase" }}
            >
              {label}
            </Link>
          ))}
          <span style={{ fontSize: 10, color: "#3a3530", letterSpacing: "0.08em", fontFamily: "'Raleway',sans-serif" }}>
            © {new Date().getFullYear()} Éloquence AI
          </span>
        </footer>
      </body>
    </html>
  )
}