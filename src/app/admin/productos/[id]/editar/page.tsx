import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { categories } from "@/lib/products";
import { getProductById } from "@/lib/orders/store";
import { updateProductAction } from "@/app/admin/actions";
import ProductForm from "@/components/admin/product-form-dynamic";

export const dynamic = "force-dynamic";

export default async function AdminEditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ guardado?: string; duplicado?: string }>;
}) {
  await requireAdmin();

  const [{ id }, { guardado, duplicado }] = await Promise.all([params, searchParams]);
  const product = await getProductById(Number(id));
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-widest text-amber-400">
          Catálogo
        </p>
        <h1 className="mt-1 text-3xl font-bold text-zinc-50">
          Editar · {product.name}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Actualizá los datos y guardá los cambios.
        </p>
      </div>

      {duplicado === "1" ? (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-900/70 bg-amber-950/30 px-4 py-3 text-sm text-amber-300">
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copia creada. Ajustá el precio y el stock (nació agotada) antes de publicarla.
        </div>
      ) : null}

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
      />
    </div>
  );
}
