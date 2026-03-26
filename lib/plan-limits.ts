export const PLAN_LIMITS = {
  free:     { vocal: 2,        simulations: 1,        training: 20,       discourse: 1,        juridique: 0,        pdf: false, themis: false },
  basique:  { vocal: 10,       simulations: 5,        training: 200,      discourse: 5,        juridique: 10,       pdf: false, themis: true  },
  illimite: { vocal: Infinity, simulations: Infinity, training: Infinity, discourse: Infinity, juridique: Infinity, pdf: true,  themis: true  },
}

export type PlanKey = keyof typeof PLAN_LIMITS
export type FeatureKey = keyof typeof PLAN_LIMITS.free

export function getPlanLimits(plan: string | null | undefined) {
  const p = plan as PlanKey
  return PLAN_LIMITS[p] ?? PLAN_LIMITS.free
}

export function isFeatureBlocked(plan: string | null | undefined, feature: FeatureKey): boolean {
  const limits = getPlanLimits(plan)
  const limit = limits[feature]
  if (typeof limit === "boolean") return !limit
  return limit === 0
}

export async function fetchUsage(feature: string): Promise<number> {
  try {
    const res = await fetch(`/api/backend/payments/usage?feature=${encodeURIComponent(feature)}`)
    if (!res.ok) return 0
    const data = await res.json()
    return data.used ?? 0
  } catch {
    return 0
  }
}

export async function trackUsage(feature: string): Promise<number> {
  try {
    const res = await fetch("/api/backend/payments/usage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feature }),
    })
    if (!res.ok) return 0
    const data = await res.json()
    return data.used ?? 0
  } catch {
    return 0
  }
}

export function isQuotaReached(plan: string | null | undefined, feature: FeatureKey, used: number): boolean {
  const limits = getPlanLimits(plan)
  const limit = limits[feature]
  if (typeof limit === "boolean") return false
  if (limit === Infinity) return false
  return used >= limit
}

export function planLabel(plan: string | null | undefined): string {
  if (plan === "basique")  return "Basique"
  if (plan === "illimite") return "Illimité"
  return "Gratuit"
}
