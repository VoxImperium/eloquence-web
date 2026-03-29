import { createClient } from "@/lib/supabase"

/**
 * Fetch user's beta tester status from profile.
 * Returns true if user is a beta tester, false otherwise.
 */
export async function isBetaTester(userId: string): Promise<boolean> {
  if (!userId) return false

  try {
    const supabase = createClient()
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("is_beta_tester")
      .eq("id", userId)
      .single()

    if (error) {
      console.error("Failed to fetch beta tester status:", error)
      return false
    }

    return profile?.is_beta_tester ?? false
  } catch (err) {
    console.error("Error checking beta tester status:", err)
    return false
  }
}
