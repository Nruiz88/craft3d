import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { and, eq } from "drizzle-orm";
import { authOptions } from "@/auth";
import { db } from "@/lib/db/client";
import { wishlists } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

async function resolveUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

export async function GET() {
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ slugs: [] });

  try {
    const rows = await db
      .select({ product_slug: wishlists.product_slug })
      .from(wishlists)
      .where(eq(wishlists.user_id, userId));
    return NextResponse.json({ slugs: rows.map((row) => row.product_slug) });
  } catch (error) {
    return NextResponse.json(
      {
        slugs: [],
        error: error instanceof Error ? error.message : "No se pudo cargar",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const userId = await resolveUserId();
  if (!userId) {
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

  try {
    await db
      .insert(wishlists)
      .values({ user_id: userId, product_slug: slug })
      .onConflictDoNothing();
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo guardar" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const userId = await resolveUserId();
  if (!userId) {
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

  try {
    await db
      .delete(wishlists)
      .where(
        and(
          eq(wishlists.user_id, userId),
          eq(wishlists.product_slug, slug),
        ),
      );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo eliminar" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
