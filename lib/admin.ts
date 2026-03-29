export const ADMIN_EMAILS = ["bakhchimalik@gmail.com"]

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

export function hasUnlimitedAccess(isAdmin: boolean, isBetaTester: boolean): boolean {
  return isAdmin || isBetaTester
}
