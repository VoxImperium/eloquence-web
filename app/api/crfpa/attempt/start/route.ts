import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { StartAttemptBody } from "@/types/crfpa"

export async function POST(req: NextRequest) {
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

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 })
  }

  const { subject_id } = body as StartAttemptBody
  if (!subject_id || typeof subject_id !== "number") {
    return NextResponse.json({ error: "subject_id manquant ou invalide" }, { status: 400 })
  }

  // Verify the subject exists
  const { data: subject, error: subjectError } = await supabase
    .from("crfpa_subjects")
    .select("id")
    .eq("id", subject_id)
    .maybeSingle()

  if (subjectError || !subject) {
    return NextResponse.json({ error: "Sujet introuvable" }, { status: 404 })
  }

  // Create the attempt
  const { data: attempt, error: insertError } = await supabase
    .from("crfpa_attempts")
    .insert({
      user_id:     user.id,
      subject_id,
      status:      "prep",
      qa_transcript: { exchanges: [] },
    })
    .select("id")
    .single()

  if (insertError || !attempt) {
    console.error("[CRFPA/attempt/start] Insert error:", {
      code:    insertError?.code,
      message: insertError?.message,
      details: insertError?.details,
    })
    const isDev = process.env.NODE_ENV === "development"
    return NextResponse.json(
      {
        error:   "Impossible de créer la tentative",
        ...(isDev && insertError && {
          debug: {
            code:    insertError.code,
            message: insertError.message,
            details: insertError.details,
          },
        }),
      },
      { status: 500 },
    )
  }

  return NextResponse.json({
    attempt_id:         attempt.id,
    prep_time_seconds:  3600, // 60 minutes de préparation
  })
}
