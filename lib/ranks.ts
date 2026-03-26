export type Rank = {
  level: number
  title: string
  minXP: number
  color: string
}

export const RANKS: Rank[] = [
  { level: 1, title: "Novice",        minXP: 0,      color: "#6a6258" },
  { level: 2, title: "Orateur",       minXP: 500,    color: "#8a8070" },
  { level: 3, title: "Rhéteur",       minXP: 1500,   color: "#c9a84c" },
  { level: 4, title: "Tribun",        minXP: 3500,   color: "#d4b85a" },
  { level: 5, title: "Avocat",        minXP: 7000,   color: "#e8c96a" },
  { level: 6, title: "Grand Orateur", minXP: 12000,  color: "#f5e0a0" },
  { level: 7, title: "Maître",        minXP: 20000,  color: "#ffffff" },
]

export function getRank(xp: number): Rank {
  let rank = RANKS[0]
  for (const r of RANKS) {
    if (xp >= r.minXP) rank = r
  }
  return rank
}

export function getNextRank(xp: number): Rank | null {
  for (const r of RANKS) {
    if (xp < r.minXP) return r
  }
  return null
}

export function getXPProgress(xp: number): number {
  const current = getRank(xp)
  const next = getNextRank(xp)
  if (!next) return 100
  const range = next.minXP - current.minXP
  const progress = xp - current.minXP
  return Math.min(100, Math.floor((progress / range) * 100))
}

export function calculateXP(profile: any, sessions: any[]): number {
  let xp = 0
  for (const s of sessions) {
    // Base XP per session type
    const type = s.type || ""
    if (type === "simulation") {
      xp += 80
    } else if (type === "training" || type === "sujet") {
      xp += 20
    } else if (type === "speech" || type === "discourse") {
      xp += 80
    } else if (type === "juridique" || type === "cas_pratique") {
      xp += 60
    } else {
      // Default: vocal analysis
      xp += 100
    }
    // Bonus for high score
    const globalScore = s.feedback?.scores?.global
    if (typeof globalScore === "number" && globalScore >= 8) {
      xp += 30
    }
  }
  return xp
}

// Roman numeral helper for level display
export function toRoman(n: number): string {
  const map: [number, string][] = [
    [7, "VII"], [6, "VI"], [5, "V"], [4, "IV"],
    [3, "III"], [2, "II"], [1, "I"],
  ]
  for (const [val, str] of map) {
    if (n >= val) return str
  }
  return String(n)
}
