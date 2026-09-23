import Link from "next/link";
import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { wishlists } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/user";
import { getAllProducts } from "@/lib/orders/store";
import ProductCard from "@/components/product/product-card";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import FadeIn from "@/components/ui/fade-in";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Favoritos",
  description: "Tus productos guardados en Craft3d.",
};

export default async function FavoritosPage() {
  const user = await getCurrentUser();

  let products = [] as Awaited<ReturnType<typeof getAllProducts>>;
  if (user) {
    try {
      const rows = await db
        .select({ slug: wishlists.product_slug })
        .from(wishlists)
        .where(eq(wishlists.user_id, user.id));
      const slugs = rows.map((r) => r.slug);
      if (slugs.length > 0) {
        const all = await getAllProducts();
        products = all.filter((p) => slugs.includes(p.slug));
      }
    } catch {
      products = [];
    }
  }

  return (
    <div className="bg-zinc-950 pb-20">
      <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
        <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Favoritos" }]} />
        <h1 className="pixel mt-4 text-3xl text-zinc-100">
          ♥ MIS <span className="text-rose-400">FAVORITOS</span>
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          {user
            ? "Los productos que guardaste con el corazón."
            : "Ingresá a tu cuenta para guardar y ver tus favoritos."}
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        {!user ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-14 text-center">
            <p className="text-4xl" aria-hidden="true">🔐</p>
            <p className="mt-4 text-lg font-semibold text-zinc-200">Ingresá para ver tus favoritos</p>
            <Link
              href="/ingresar?next=/favoritos"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-400 px-7 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-300"
            >
              Ingresar
            </Link>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-14 text-center">
            <p className="text-4xl" aria-hidden="true">💔</p>
            <p className="mt-4 text-lg font-semibold text-zinc-200">Todavía no guardaste favoritos</p>
            <p className="mt-2 text-sm text-zinc-500">
              Tocá el corazón en cualquier producto para guardarlo acá.
            </p>
            <Link
              href="/catalogo"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-400 px-7 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-300"
            >
              Ir al catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, i) => (
              <FadeIn key={product.slug} delay={Math.min(i * 80, 400)}>
                <ProductCard product={product} />
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
