import type { Metadata } from "next"
import "./globals.css"
import Nav from "@/components/Nav"

export const metadata: Metadata = {
  title: "Éloquence.ai — L'art oratoire sublimé par l'intelligence artificielle",
  description: "Analyse vocale, simulation d'élite, entraînement socratique et réécriture oratoire. Pour les orateurs d'exception.",
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
      </body>
    </html>
  )
}
