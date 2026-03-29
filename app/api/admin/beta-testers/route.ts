import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { isAdminEmail } from "@/lib/admin"
import { createServiceClient } from "@/lib/supabase"

async function getAuthenticatedAdmin() {
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

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  if (!isAdminEmail(user.email)) return null
  return user
}

export async function GET(req: NextRequest) {
  const admin = await getAuthenticatedAdmin()
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)))
  const search = searchParams.get("search")?.trim() ?? ""
  const offset = (page - 1) * limit

  const supabase = createServiceClient()

  let query = supabase
    .from("profiles")
    .select("id, email, is_beta_tester", { count: "exact" })
    .order("email", { ascending: true })
    .range(offset, offset + limit - 1)

  if (search) {
    query = query.ilike("email", `%${search}%`)
  }

  const { data, error, count } = await query

  if (error) {
    console.error("Failed to fetch profiles:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    })
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }

  return NextResponse.json({
    users: data ?? [],
    total: count ?? 0,
    page,
    limit,
  })
}

export async function POST(req: NextRequest) {
  const admin = await getAuthenticatedAdmin()
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const userId = (body as Record<string, unknown>)?.userId as string | undefined
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { error } = await supabase
    .from("profiles")
    .update({ is_beta_tester: true })
    .eq("id", userId)

  if (error) {
    console.error("Failed to add beta tester:", error)
    return NextResponse.json({ error: "Failed to add beta tester" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const admin = await getAuthenticatedAdmin()
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const userId = (body as Record<string, unknown>)?.userId as string | undefined
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { error } = await supabase
    .from("profiles")
    .update({ is_beta_tester: false })
    .eq("id", userId)

  if (error) {
    console.error("Failed to remove beta tester:", error)
    return NextResponse.json({ error: "Failed to remove beta tester" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
