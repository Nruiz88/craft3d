import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-user";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getAllProducts } from "@/lib/store";
import ProductCard from "@/components/product-card";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/ingresar?next=/favoritos");

  const supabase = await createSupabaseServerClient();
  const [wishlistRes, allProducts] = await Promise.all([
    supabase.from("wishlists").select("product_slug").eq("user_id", user.id),
    getAllProducts(),
  ]);

  const savedSlugs = new Set((wishlistRes.data ?? []).map((row) => row.product_slug));
  const items = allProducts.filter((product) => savedSlugs.has(product.slug));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="pixel text-[10px] tracking-widest text-rose-400">♥ FAVORITOS</p>
          <h1 className="mt-2 text-3xl font-bold text-zinc-50 sm:text-4xl">
            Tu lista de favoritos
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Guardaste {items.length}{" "}
            {items.length === 1 ? "producto" : "productos"}. Volvé cuando quieras
            a completar tu compra.
          </p>
        </div>
        <Link
          href="/catalogo"
          className="text-sm font-medium text-cyan-300 transition-colors hover:text-cyan-200"
        >
          Explorar catálogo →
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-900/40 px-6 py-16 text-center">
          <div className="text-5xl" aria-hidden="true">
            💔
          </div>
          <h2 className="mt-4 text-lg font-semibold text-zinc-100">
            Todavía no guardaste nada
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
            Tocate el corazón en cualquier producto para guardarlo acá y volver a
            comprarlo cuando quieras.
          </p>
          <Link
            href="/catalogo"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-300"
          >
            Ver el catálogo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
