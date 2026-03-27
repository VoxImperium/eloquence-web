import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

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

  const { data, error } = await supabase
    .from("crfpa_attempts")
    .select(`
      id,
      final_score,
      status,
      created_at,
      crfpa_subjects (title, category)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("[CRFPA/user/history] Supabase error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }

  const history = (data ?? []).map((row) => {
    const subject = Array.isArray(row.crfpa_subjects)
      ? row.crfpa_subjects[0]
      : row.crfpa_subjects
    return {
      id:              row.id,
      subject_title:   subject?.title ?? "Sujet inconnu",
      subject_category: subject?.category ?? null,
      final_score:     row.final_score,
      status:          row.status,
      created_at:      row.created_at,
    }
  })

  return NextResponse.json(history)
}
