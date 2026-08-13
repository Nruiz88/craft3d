import { requireAdmin } from "@/lib/auth";
import { categories } from "@/lib/products";
import { createProductAction } from "../../actions";
import { getAllProducts } from "@/lib/store";
import ProductForm from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function AdminNewMysteryBoxPage() {
  await requireAdmin();

  const allProducts = await getAllProducts();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-widest text-amber-400">
          Mystery box · Cajas sorpresa
        </p>
        <h1 className="mt-1 text-3xl font-bold text-zinc-50">Nueva caja sorpresa</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Definí la caja, su precio, el stock y las piezas que la integran.
        </p>
      </div>
      <ProductForm
        categories={categories}
        action={createProductAction}
        defaultCategory="mystery-box"
        backHref="/admin/mysterybox"
        allProducts={allProducts}
      />
    </div>
  );
}
