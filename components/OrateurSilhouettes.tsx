export default function OrateurSilhouettes() {
  return (
    <svg viewBox="0 0 480 520" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
      <defs>
        <linearGradient id="gIvory" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f5f0e8" stopOpacity="1"/>
          <stop offset="80%" stopColor="#f5f0e8" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="#f5f0e8" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="gIvory2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f5f0e8" stopOpacity="0.85"/>
          <stop offset="100%" stopColor="#f5f0e8" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="gGoldFloor" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#c9a84c" stopOpacity="0.12"/>
          <stop offset="100%" stopColor="#c9a84c" stopOpacity="0"/>
        </linearGradient>
        <filter id="sfxMain">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#c9a84c" floodOpacity="0.12"/>
        </filter>
        <filter id="sfxSide">
          <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#c9a84c" floodOpacity="0.08"/>
        </filter>
      </defs>

      {/* Lumière scène */}
      <ellipse cx="240" cy="508" rx="200" ry="18" fill="url(#gGoldFloor)"/>

      {/* CICÉRON — gauche, toge, index pointé, rouleau */}
      <g filter="url(#sfxSide)" style={{animation:"floatB 7s ease-in-out infinite",transformOrigin:"100px 460px"}}>
        <ellipse cx="100" cy="65" rx="22" ry="25" fill="url(#gIvory2)"/>
        <path d="M80 64 C77 62 76 66 79 69 C81 71 83 70 81 66Z" fill="url(#gIvory2)"/>
        <rect x="91" y="88" width="12" height="14" rx="3" fill="url(#gIvory2)"/>
        <path d="M76 102 C68 112 66 132 68 162 C70 187 74 210 78 232 L124 232 C122 210 120 187 120 162 C122 132 120 112 112 102 C106 98 100 96 97 98 C91 96 84 98 76 102Z" fill="url(#gIvory2)"/>
        <path d="M78 114 Q72 144 74 172" stroke="rgba(245,240,232,0.18)" strokeWidth="1" fill="none"/>
        <path d="M118 118 C134 108 150 96 164 84 C170 78 168 74 164 78 C150 86 134 98 120 112Z" fill="url(#gIvory2)"/>
        <path d="M165 80 C169 74 172 68 170 64 C168 60 164 62 163 68 C162 72 163 76 165 80Z" fill="url(#gIvory2)"/>
        <path d="M168 66 C172 60 173 54 171 50 C169 47 165 50 165 55Z" fill="url(#gIvory2)" opacity="0.8"/>
        <path d="M78 118 C68 130 62 148 64 166 C66 176 70 178 74 172 C78 164 78 146 82 132Z" fill="url(#gIvory2)"/>
        <rect x="56" y="158" width="16" height="24" rx="6" fill="url(#gIvory2)" opacity="0.8"/>
        <line x1="56" y1="166" x2="72" y2="166" stroke="rgba(201,168,76,0.2)" strokeWidth="0.5"/>
        <line x1="56" y1="171" x2="72" y2="171" stroke="rgba(201,168,76,0.2)" strokeWidth="0.5"/>
        <path d="M84 232 C82 272 80 314 80 362 C80 376 84 386 94 387 C104 386 106 376 106 362 C104 314 104 272 100 232Z" fill="url(#gIvory2)" opacity="0.85"/>
        <path d="M108 232 C110 272 112 314 114 362 C116 376 120 386 130 387 C140 386 140 376 138 362 C136 314 132 272 128 232Z" fill="url(#gIvory2)" opacity="0.85"/>
        <path d="M82 387 C78 391 76 396 80 399 C86 403 104 403 108 399 C112 395 110 391 106 387Z" fill="url(#gIvory2)" opacity="0.55"/>
        <path d="M116 387 C112 391 110 395 114 399 C120 403 136 403 140 399 C144 395 142 391 138 387Z" fill="url(#gIvory2)" opacity="0.55"/>
      </g>
      {/* Onde Cicéron */}
      <g style={{animation:"waveOrateur 2s ease-in-out infinite"}}>
        <path d="M168 82 C176 76 176 90 168 94" stroke="#c9a84c" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M176 76 C188 68 188 96 176 100" stroke="#c9a84c" strokeWidth="1" fill="none" strokeLinecap="round"/>
      </g>
      <ellipse cx="100" cy="440" rx="46" ry="7" fill="rgba(201,168,76,0.06)"/>

      {/* DE GAULLE — centre, uniforme, bras levés */}
      <g filter="url(#sfxMain)" style={{animation:"floatA 6s ease-in-out infinite",transformOrigin:"240px 480px"}}>
        <path d="M222 58 C212 52 206 40 208 28 C210 16 222 10 238 12 C254 14 262 26 258 40 C254 52 238 64 222 58Z" fill="url(#gIvory)"/>
        <path d="M208 28 C208 20 212 16 238 14 C264 12 268 16 268 24" stroke="rgba(245,240,232,0.25)" strokeWidth="2" fill="none"/>
        <rect x="228" y="58" width="18" height="18" rx="3" fill="url(#gIvory)"/>
        <path d="M194 76 C184 84 178 102 178 132 C178 162 182 202 184 232 L274 232 C276 202 280 162 280 132 C280 102 274 84 264 76 C256 72 248 70 237 70 C226 70 218 72 194 76Z" fill="url(#gIvory)"/>
        <path d="M212 76 L224 102 L237 80 L250 102 L262 76" stroke="rgba(245,240,232,0.12)" strokeWidth="1" fill="none"/>
        <circle cx="204" cy="108" r="3.5" fill="rgba(201,168,76,0.45)"/>
        <circle cx="196" cy="116" r="3" fill="rgba(201,168,76,0.35)"/>
        <circle cx="204" cy="123" r="3" fill="rgba(201,168,76,0.3)"/>
        <circle cx="196" cy="131" r="2.5" fill="rgba(201,168,76,0.25)"/>
        <path d="M194 98 C176 84 156 66 138 48 C132 42 128 46 130 52 C132 58 140 66 148 72 C162 82 178 94 194 108Z" fill="url(#gIvory)"/>
        <path d="M128 50 C124 44 120 38 122 32 C124 28 130 30 131 37 C132 41 130 46 128 50Z" fill="url(#gIvory)"/>
        <path d="M122 33 C118 26 117 19 120 14 C122 10 128 13 128 20Z" fill="url(#gIvory)" opacity="0.85"/>
        <path d="M268 98 C286 84 308 66 326 48 C332 42 336 46 334 52 C332 58 324 66 316 72 C302 82 286 94 268 108Z" fill="url(#gIvory)"/>
        <path d="M334 50 C338 44 342 38 340 32 C338 28 332 30 331 37 C330 41 332 46 334 50Z" fill="url(#gIvory)"/>
        <path d="M340 33 C344 26 345 19 342 14 C340 10 334 13 334 20Z" fill="url(#gIvory)" opacity="0.85"/>
        {/* Pupitre discret */}
        <path d="M208 250 L268 250 L264 380 L212 380Z" fill="rgba(245,240,232,0.04)" stroke="rgba(245,240,232,0.06)" strokeWidth="0.5"/>
        <line x1="208" y1="250" x2="238" y2="218" stroke="rgba(245,240,232,0.06)" strokeWidth="6" strokeLinecap="round"/>
        <line x1="268" y1="250" x2="238" y2="218" stroke="rgba(245,240,232,0.06)" strokeWidth="6" strokeLinecap="round"/>
        <path d="M200 232 C196 282 192 332 190 382 C188 397 192 410 206 410 C220 410 222 397 222 382 C222 332 224 282 224 232Z" fill="url(#gIvory)" opacity="0.9"/>
        <path d="M250 232 C252 282 254 332 256 382 C258 397 262 410 276 410 C290 410 292 397 290 382 C288 332 284 282 280 232Z" fill="url(#gIvory)" opacity="0.9"/>
        <path d="M192 410 C186 414 184 420 190 424 C196 428 218 428 222 424 C226 420 224 414 218 410Z" fill="url(#gIvory)" opacity="0.65"/>
        <path d="M258 410 C252 414 250 420 256 424 C262 428 284 428 288 424 C292 420 290 414 284 410Z" fill="url(#gIvory)" opacity="0.65"/>
      </g>
      <ellipse cx="237" cy="448" rx="70" ry="10" fill="rgba(201,168,76,0.09)"/>

      {/* MLK — droite, costume, bras vers le ciel */}
      <g filter="url(#sfxSide)" style={{animation:"floatC 8s ease-in-out infinite",transformOrigin:"376px 460px"}}>
        <path d="M362 74 C352 68 346 56 350 44 C354 32 366 26 378 30 C390 34 396 46 392 60 C388 72 374 80 362 74Z" fill="url(#gIvory2)"/>
        <rect x="362" y="74" width="16" height="15" rx="3" fill="url(#gIvory2)"/>
        <path d="M338 90 C330 98 326 118 326 146 C326 173 330 208 332 236 L408 236 C410 208 414 173 414 146 C414 118 410 98 402 90 C394 86 386 84 370 84 C354 84 346 86 338 90Z" fill="url(#gIvory2)"/>
        <path d="M370 90 L374 138 L370 148 L366 138 L370 90Z" fill="rgba(245,240,232,0.18)"/>
        <path d="M336 108 C318 90 302 70 290 48 C286 40 290 36 296 40 C302 44 310 56 318 68 C328 82 338 98 344 116Z" fill="url(#gIvory2)"/>
        <path d="M292 42 C286 32 284 22 288 16 C292 10 298 14 298 24 C298 30 296 37 292 42Z" fill="url(#gIvory2)"/>
        <path d="M288 17 C284 10 284 2 288 -2 C291 -4 296 0 294 8Z" fill="url(#gIvory2)" opacity="0.85"/>
        <path d="M293 -1 C291 -8 292 -14 296 -16 C299 -17 302 -13 300 -6Z" fill="url(#gIvory2)" opacity="0.7"/>
        <path d="M404 108 C420 94 434 78 442 62 C446 54 444 50 440 54 C434 60 426 72 416 86 C408 98 404 112 404 124Z" fill="url(#gIvory2)"/>
        <rect x="402" y="106" width="22" height="28" rx="2" fill="url(#gIvory2)" opacity="0.75"/>
        <line x1="413" y1="112" x2="413" y2="128" stroke="rgba(201,168,76,0.3)" strokeWidth="0.8"/>
        <line x1="406" y1="118" x2="420" y2="118" stroke="rgba(201,168,76,0.3)" strokeWidth="0.8"/>
        <path d="M346 236 C344 278 340 322 338 372 C336 388 340 402 354 402 C368 402 370 388 370 372 C370 322 370 278 368 236Z" fill="url(#gIvory2)" opacity="0.88"/>
        <path d="M382 236 C384 278 386 322 386 372 C386 388 390 402 404 402 C418 402 420 388 418 372 C416 322 412 278 408 236Z" fill="url(#gIvory2)" opacity="0.88"/>
        <path d="M340 402 C334 406 332 412 338 416 C344 420 364 420 368 416 C372 412 370 406 364 402Z" fill="url(#gIvory2)" opacity="0.6"/>
        <path d="M388 402 C382 406 380 412 386 416 C392 420 412 420 416 416 C420 412 418 406 412 402Z" fill="url(#gIvory2)" opacity="0.6"/>
      </g>
      {/* Onde MLK */}
      <g style={{animation:"waveOrateur 2s ease-in-out infinite", animationDelay:"0.8s"}}>
        <path d="M288 40 C280 34 280 48 288 52" stroke="#c9a84c" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M280 34 C268 26 268 54 280 58" stroke="#c9a84c" strokeWidth="1" fill="none" strokeLinecap="round"/>
      </g>
      <ellipse cx="374" cy="442" rx="50" ry="7" fill="rgba(201,168,76,0.06)"/>

      {/* Ligne de scène */}
      <line x1="20" y1="448" x2="460" y2="448" stroke="rgba(201,168,76,0.1)" strokeWidth="0.5"/>

      <style>{`
        @keyframes floatA { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes floatB { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes floatC { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-15px)} }
        @keyframes waveOrateur { 0%,100%{opacity:.2} 50%{opacity:.6} }
      `}</style>
    </svg>
  )
}
