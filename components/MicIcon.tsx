// Icône micro animée SVG — pour la page /record
export default function MicIcon({ recording = false }: { recording?: boolean }) {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="micGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c6aff"/>
          <stop offset="100%" stopColor="#00d4ff"/>
        </linearGradient>
        <filter id="micGlow">
          <feGaussianBlur stdDeviation={recording ? "3" : "1"} result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Corps micro */}
      <rect x="18" y="6" width="12" height="22" rx="6" fill="url(#micGrad)" filter="url(#micGlow)"/>
      {/* Arc */}
      <path d="M10 24 Q10 36 24 36 Q38 36 38 24" stroke="url(#micGrad)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* Pied */}
      <line x1="24" y1="36" x2="24" y2="44" stroke="url(#micGrad)" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="16" y1="44" x2="32" y2="44" stroke="url(#micGrad)" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Ondes si enregistrement */}
      {recording && (
        <>
          <path d="M6 20 Q8 24 6 28" stroke="#ff6af0" strokeWidth="2" strokeLinecap="round" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1s" repeatCount="indefinite"/>
          </path>
          <path d="M42 20 Q40 24 42 28" stroke="#ff6af0" strokeWidth="2" strokeLinecap="round" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1s" repeatCount="indefinite" begin="0.5s"/>
          </path>
        </>
      )}
    </svg>
  )
}
