import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { CrfpaSubject } from "@/types/crfpa"

export async function GET(_req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(list) { list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) },
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  // Get total count for random offset calculation
  const { count, error: countError } = await supabase
    .from("crfpa_subjects")
    .select("id", { count: "exact", head: true })

  if (countError || count === null || count === 0) {
    return NextResponse.json({ error: "Aucun sujet disponible" }, { status: 404 })
  }

  // Pick a random offset and fetch one subject
  const randomOffset = Math.floor(Math.random() * count)

  const { data, error } = await supabase
    .from("crfpa_subjects")
    .select("id, title, description, difficulty, year, source_name, category")
    .range(randomOffset, randomOffset)
    .limit(1)

  if (error || !data || data.length === 0) {
    console.error("[CRFPA/subject/random] Supabase error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }

  const subject = data[0] as Pick<
    CrfpaSubject,
    "id" | "title" | "description" | "difficulty" | "year" | "source_name" | "category"
  >

  return NextResponse.json(subject)
}
