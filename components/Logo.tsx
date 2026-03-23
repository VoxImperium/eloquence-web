// Logo Éloquence.ai — SVG animé
export default function Logo({ size = 40, animate = false }: { size?: number, animate?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c6aff"/>
          <stop offset="50%" stopColor="#00d4ff"/>
          <stop offset="100%" stopColor="#ff6af0"/>
        </linearGradient>
        <filter id="logoGlow">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Fond rond */}
      <circle cx="50" cy="50" r="48" fill="url(#logoGrad)" opacity="0.15"/>
      <circle cx="50" cy="50" r="48" stroke="url(#logoGrad)" strokeWidth="1.5" fill="none"/>

      {/* Silhouette orateur stylisée */}
      {/* Tête */}
      <circle cx="50" cy="28" r="10" fill="url(#logoGrad)" filter="url(#logoGlow)"/>
      {/* Corps */}
      <path d="M35 70 Q35 48 50 45 Q65 48 65 70" fill="url(#logoGrad)" opacity="0.9"/>
      {/* Bras gauche levé */}
      <path d="M35 55 Q25 45 20 35" stroke="url(#logoGrad)" strokeWidth="4" strokeLinecap="round" fill="none"/>
      {/* Bras droit levé */}
      <path d="M65 55 Q75 45 80 35" stroke="url(#logoGrad)" strokeWidth="4" strokeLinecap="round" fill="none"/>
      {/* Onde sonore */}
      <path d="M18 60 Q23 55 18 50" stroke="#00d4ff" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M12 65 Q20 55 12 45" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4"/>
      <path d="M82 60 Q77 55 82 50" stroke="#7c6aff" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M88 65 Q80 55 88 45" stroke="#7c6aff" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4"/>

      {animate && (
        <>
          <animateTransform attributeName="transform" type="scale" values="1;1.02;1" dur="3s" repeatCount="indefinite"/>
        </>
      )}
    </svg>
  )
}
