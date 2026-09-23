import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { wishlists } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/user";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ slugs: [] });
  try {
    const rows = await db
      .select({ slug: wishlists.product_slug })
      .from(wishlists)
      .where(eq(wishlists.user_id, user.id));
    return NextResponse.json({ slugs: rows.map((r) => r.slug) });
  } catch {
    return NextResponse.json({ slugs: [] });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const { slug } = (await request.json().catch(() => ({}))) as { slug?: string };
  if (!slug) return NextResponse.json({ ok: false, error: "Falta el producto" }, { status: 400 });
  try {
    await db
      .insert(wishlists)
      .values({ user_id: user.id, product_slug: slug })
      .onDuplicateKeyUpdate({ set: { product_slug: slug } })
      .execute();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const { slug } = (await request.json().catch(() => ({}))) as { slug?: string };
  if (!slug) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    await db
      .delete(wishlists)
      .where(and(eq(wishlists.user_id, user.id), eq(wishlists.product_slug, slug)))
      .execute();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
