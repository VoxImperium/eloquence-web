import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

function getCurrentMonth(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  return `${year}-${month}`
}

const VALID_FEATURES = new Set(["vocal", "simulations", "training", "discourse", "juridique"])

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const feature = searchParams.get("feature")

  if (!feature || !VALID_FEATURES.has(feature)) {
    return NextResponse.json({ error: "Invalid or missing feature" }, { status: 400 })
  }

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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const month = getCurrentMonth()

  const { data, error } = await supabase
    .from("usage_counters")
    .select("count")
    .eq("user_id", user.id)
    .eq("feature", feature)
    .eq("month", month)
    .maybeSingle()

  if (error) {
    console.error("Supabase usage fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch usage" }, { status: 500 })
  }

  return NextResponse.json({ used: data?.count ?? 0 })
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const feature = (body as Record<string, unknown>)?.feature as string | undefined
  if (!feature || !VALID_FEATURES.has(feature)) {
    return NextResponse.json({ error: "Invalid or missing feature" }, { status: 400 })
  }

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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const month = getCurrentMonth()

  // Try using a Supabase RPC function for atomic increment.
  // The RPC `increment_usage_counter` should be created in Supabase as:
  //   CREATE OR REPLACE FUNCTION increment_usage_counter(p_user_id uuid, p_feature text, p_month text)
  //   RETURNS int LANGUAGE plpgsql AS $$
  //   DECLARE new_count int;
  //   BEGIN
  //     INSERT INTO usage_counters (user_id, feature, month, count)
  //     VALUES (p_user_id, p_feature, p_month, 1)
  //     ON CONFLICT (user_id, feature, month) DO UPDATE SET count = usage_counters.count + 1
  //     RETURNING count INTO new_count;
  //     RETURN new_count;
  //   END; $$;
  const { data, error } = await supabase.rpc("increment_usage_counter", {
    p_user_id: user.id,
    p_feature: feature,
    p_month: month,
  })

  if (error) {
    // Fall back to manual upsert if the RPC doesn't exist yet
    const { data: existing } = await supabase
      .from("usage_counters")
      .select("count")
      .eq("user_id", user.id)
      .eq("feature", feature)
      .eq("month", month)
      .maybeSingle()

    const newCount = (existing?.count ?? 0) + 1

    const { error: upsertError } = await supabase
      .from("usage_counters")
      .upsert(
        { user_id: user.id, feature, month, count: newCount },
        { onConflict: "user_id,feature,month" }
      )

    if (upsertError) {
      console.error("Supabase usage upsert error:", upsertError)
      return NextResponse.json({ error: "Failed to update usage" }, { status: 500 })
    }

    return NextResponse.json({ used: newCount })
  }

  return NextResponse.json({ used: data ?? 1 })
}
