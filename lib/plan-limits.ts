export const PLAN_LIMITS = {
  free:     { vocal: 2,        simulations: 1,        training: 20,  discourse: 1,        juridique: 0,  pdf: false, themis: false },
  etudiant: { vocal: 10,       simulations: 3,        training: 100, discourse: 4,        juridique: 5,  pdf: false, themis: true  },
  basique:  { vocal: Infinity, simulations: Infinity, training: 500, discourse: Infinity, juridique: 20, pdf: true,  themis: true  },
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

function usageKey(userId: string, feature: string): string {
  const now = new Date()
  return `eloquence_usage_${userId}_${feature}_${now.getFullYear()}_${now.getMonth()}`
}

export function getUsage(userId: string, feature: string): number {
  if (typeof window === "undefined") return 0
  return parseInt(localStorage.getItem(usageKey(userId, feature)) || "0", 10)
}

export function incrementUsage(userId: string, feature: string): void {
  if (typeof window === "undefined") return
  const key = usageKey(userId, feature)
  const current = parseInt(localStorage.getItem(key) || "0", 10)
  localStorage.setItem(key, String(current + 1))
}

export function isQuotaReached(plan: string | null | undefined, feature: FeatureKey, userId: string): boolean {
  const limits = getPlanLimits(plan)
  const limit = limits[feature]
  if (typeof limit === "boolean") return false
  if (limit === Infinity) return false
  const used = getUsage(userId, feature)
  return used >= limit
}

export function planLabel(plan: string | null | undefined): string {
  if (plan === "etudiant") return "Étudiant"
  if (plan === "basique") return "Basique"
  return "Gratuit"
}
