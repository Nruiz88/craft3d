"use client";

import dynamic from "next/dynamic";
import type { Category, Product } from "@/lib/products/types";
import type { AdminFormState } from "@/app/admin/actions";

const ProductFormInner = dynamic(() => import("./product-form"), {
  loading: () => (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-40 animate-pulse rounded-2xl bg-zinc-900/60" />
      ))}
    </div>
  ),
});

export default function ProductFormWrapper(props: {
  categories: Category[];
  product?: Product;
  action: (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  defaultCategory?: string;
  backHref?: string;
  allProducts?: Product[];
}) {
  return <ProductFormInner {...props} />;
}
