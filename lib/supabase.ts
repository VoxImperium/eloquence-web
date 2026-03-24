import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  
  if (!supabaseUrl || !supabaseKey) {
    // Retourner un client factice en build time
    return createBrowserClient(
      "https://placeholder.supabase.co",
      "placeholder-key"
    )
  }
  
  return createBrowserClient(supabaseUrl, supabaseKey)
}
