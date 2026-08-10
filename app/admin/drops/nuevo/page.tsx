import { requireAdmin } from "@/lib/auth";
import { categories } from "@/lib/products";
import { createProductAction } from "../../actions";
import ProductForm from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function AdminNewDropPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
          Drops · Ediciones numeradas
        </p>
        <h1 className="mt-1 text-3xl font-bold text-zinc-50">Nuevo drop</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Definí la pieza, su precio y la ventana desde / hasta que estará
          disponible en /drops.
        </p>
      </div>
      <ProductForm
        categories={categories}
        action={createProductAction}
        defaultCategory="drops"
        backHref="/admin/drops"
      />
    </div>
  );
}
