import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createServiceClient } from "@/lib/supabase"

const BUCKET = "crfpa-audio"

export async function POST(req: NextRequest) {
  // Verify user authentication
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

  // Parse form data
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: "FormData invalide" }, { status: 400 })
  }

  const file = formData.get("file") as File | null
  const attemptId = formData.get("attemptId") as string | null

  if (!file) {
    return NextResponse.json({ error: "Fichier audio manquant" }, { status: 400 })
  }
  if (!attemptId) {
    return NextResponse.json({ error: "attemptId manquant" }, { status: 400 })
  }

  // Use service role client for storage operations
  const adminClient = createServiceClient()

  // Ensure the bucket exists (ignore "already exists" error)
  const { error: bucketError } = await adminClient.storage.createBucket(BUCKET, { public: true })
  if (bucketError && !bucketError.message.toLowerCase().includes("already exists")) {
    console.error("[CRFPA/upload-audio] Bucket creation error:", bucketError)
    return NextResponse.json({ error: "Impossible de créer le bucket de stockage." }, { status: 500 })
  }

  const mimeType = file.type
  const ext = mimeType === "audio/mp4" || mimeType === "video/mp4" ? "mp4" : "webm"
  const timestamp = Date.now()
  const filePath = `crfpa-expose/${attemptId}/${timestamp}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { error: uploadError } = await adminClient.storage
    .from(BUCKET)
    .upload(filePath, buffer, { contentType: file.type, upsert: true })

  if (uploadError) {
    console.error("[CRFPA/upload-audio] Upload error:", uploadError)
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: urlData } = adminClient.storage.from(BUCKET).getPublicUrl(filePath)

  return NextResponse.json({ publicUrl: urlData.publicUrl })
}
