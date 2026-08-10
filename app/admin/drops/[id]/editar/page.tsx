import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { categories } from "@/lib/products";
import { getProductById } from "@/lib/store";
import { updateProductAction } from "@/app/admin/actions";
import ProductForm from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function AdminEditDropPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ guardado?: string }>;
}) {
  await requireAdmin();

  const [{ id }, { guardado }] = await Promise.all([params, searchParams]);
  const product = await getProductById(Number(id));
  if (!product) notFound();
  if (product.category !== "ediciones-limitadas") notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
          Drops · Ediciones limitadas
        </p>
        <h1 className="mt-1 text-3xl font-bold text-zinc-50">
          Editar drop · {product.name}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Ajustá la ventana del drop y guardá los cambios.
        </p>
      </div>

      {guardado === "1" ? (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-900/70 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-400">
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Cambios guardados correctamente.
        </div>
      ) : null}

      <ProductForm
        categories={categories}
        product={product}
        action={updateProductAction}
        backHref="/admin/drops"
      />
    </div>
  );
}
