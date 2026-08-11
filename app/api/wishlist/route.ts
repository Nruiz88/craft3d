import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

async function resolveUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function GET() {
  const { supabase, user } = await resolveUser();
  if (!user) return NextResponse.json({ slugs: [] });

  const { data, error } = await supabase
    .from("wishlists")
    .select("product_slug")
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ slugs: [], error: error.message }, { status: 500 });
  }

  return NextResponse.json({ slugs: (data ?? []).map((row) => row.product_slug) });
}

export async function POST(request: NextRequest) {
  const { supabase, user } = await resolveUser();
  if (!user) {
    return NextResponse.json({ error: "Necesitás iniciar sesión" }, { status: 401 });
  }

  let slug: unknown;
  try {
    const body = await request.json();
    slug = body?.slug;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (typeof slug !== "string" || !slug.trim()) {
    return NextResponse.json({ error: "Falta el producto" }, { status: 400 });
  }

  const { error } = await supabase.from("wishlists").upsert(
    { user_id: user.id, product_slug: slug },
    { onConflict: "user_id,product_slug" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const { supabase, user } = await resolveUser();
  if (!user) {
    return NextResponse.json({ error: "Necesitás iniciar sesión" }, { status: 401 });
  }

  let slug: unknown;
  try {
    const body = await request.json();
    slug = body?.slug;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (typeof slug !== "string" || !slug.trim()) {
    return NextResponse.json({ error: "Falta el producto" }, { status: 400 });
  }

  const { error } = await supabase
    .from("wishlists")
    .delete()
    .eq("user_id", user.id)
    .eq("product_slug", slug);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
