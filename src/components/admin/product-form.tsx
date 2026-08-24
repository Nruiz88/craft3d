"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { AdminFormState } from "@/app/admin/actions";
import type { Category, Product } from "@/lib/products/types";
import { mysteryRarityOptions, parseMysteryRarity, getMysteryBoxIncludes } from "@/lib/mystery-box";
import { formatPrice } from "@/lib/utils/format";
import { inputClass, labelClass, toLocalInput, fileToDataUrl } from "./form-helpers";
import Section from "./form-section";
import PhotoSlot from "./photo-slot";
import BoxIncludesEditor from "./box-includes-editor";
import ProductPreview from "./product-preview";

export default function ProductForm({
  categories,
  product,
  action,
  defaultCategory,
  backHref = "/admin/productos",
  allProducts = [],
}: {
  categories: Category[];
  product?: Product;
  action: (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  defaultCategory?: string;
  backHref?: string;
  allProducts?: Product[];
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  const [name, setName] = useState(product?.name ?? "");
  const [category, setCategory] = useState<string>(
    product?.category ?? defaultCategory ?? categories[0]?.id,
  );
  const [price, setPrice] = useState(
    product?.price != null ? String(product.price) : "",
  );
  const [weightGrams, setWeightGrams] = useState(product?.weightGrams != null ? String(product.weightGrams) : "");
  const [widthCm, setWidthCm] = useState(product?.widthCm != null ? String(product.widthCm) : "");
  const [heightCm, setHeightCm] = useState(product?.heightCm != null ? String(product.heightCm) : "");
  const [depthCm, setDepthCm] = useState(product?.depthCm != null ? String(product.depthCm) : "");
  const [stock, setStock] = useState(
    product?.stock != null ? String(product.stock) : "",
  );
  const [emoji, setEmoji] = useState(product?.emoji ?? "📦");
  const [imageUrl, setImageUrl] = useState(
    product?.image && !product.image.startsWith("data:") ? product.image : "",
  );
  const [imageData, setImageData] = useState(
    product?.image?.startsWith("data:") ? product.image : "",
  );
  const [description, setDescription] = useState(product?.description ?? "");
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [dropStartsAt, setDropStartsAt] = useState(
    toLocalInput(product?.dropStartsAt ?? null),
  );
  const [dropEndsAt, setDropEndsAt] = useState(
    toLocalInput(product?.dropEndsAt ?? null),
  );
  const [dropUnits, setDropUnits] = useState(
    product?.dropUnits != null ? String(product.dropUnits) : "",
  );

  const preview = imageData || imageUrl;

  const initialBoxIncludes = (() => {
    const init: Record<string, number> = {};
    for (const inc of getMysteryBoxIncludes(product?.tags ?? [])) {
      init[inc.slug] = inc.qty;
    }
    return init;
  })();

  async function handlePrimaryImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setImageData(await fileToDataUrl(file));
      setImageUrl("");
    } catch {
      // Imagen inválida
    }
    e.target.value = "";
  }

  function clearPrimaryImage() {
    setImageData("");
    setImageUrl("");
  }

  return (
    <form action={formAction} className="space-y-6">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      <input type="hidden" name="origen" value={backHref} />

      {state?.error ? (
        <div role="alert" className="flex items-center gap-3 rounded-xl border border-red-900/70 bg-red-950/30 px-4 py-3 text-sm text-red-400">
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
          {state.error}
        </div>
      ) : null}

      {/* ─── Básico ─── */}
      <Section
        icon={<svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>}
        title="Información básica"
        hint="Nombre, URL y categoría del producto"
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="name" className={labelClass}>Nombre *</label>
            <input id="name" name="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Ej: Lámpara Luffy Gear 5" />
          </div>
          <div>
            <label htmlFor="slug" className={labelClass}>Slug (URL)</label>
            <input id="slug" name="slug" type="text" defaultValue={product?.slug ?? ""} className={`${inputClass} font-mono`} placeholder="Auto desde el nombre" />
            <p className="mt-1 text-xs text-zinc-500">Se genera solo si lo dejás vacío.</p>
          </div>
          <div>
            <label htmlFor="category" className={labelClass}>Categoría *</label>
            <select id="category" name="category" required value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
              {categories.map((c) => (<option key={c.id} value={c.id}>{c.emoji} {c.name}</option>))}
            </select>
          </div>
        </div>
      </Section>

      {/* ─── Precio y stock ─── */}
      <Section
        icon={<svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M16 8.5c-.7-.7-1.8-1-3-1-2 0-3.5 1-3.5 2.5S11 12 14 12.5s3.5 1 3.5 2.5-1.5 2.5-3.5 2.5c-1.2 0-2.3-.3-3-1" /><path d="M12 6v12" /></svg>}
        title="Precio y stock"
        hint="Precio en pesos argentinos y disponibilidad"
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="price" className={labelClass}>Precio ($) *</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500">$</span>
              <input id="price" name="price" type="number" min="0" step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)} className={`${inputClass} pl-8 tabular-nums`} placeholder="65000" />
            </div>
          </div>
          <div>
            <label htmlFor="stock" className={labelClass}>Stock *</label>
            <input id="stock" name="stock" type="number" min="0" step="1" required value={stock} onChange={(e) => setStock(e.target.value)} className={`${inputClass} tabular-nums`} placeholder="0" />
          </div>
        </div>
      </Section>

      {/* ─── Peso y dimensiones ─── */}
      <Section icon={<svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3"/></svg>} title="Peso y dimensiones" hint="Para calcular el costo de envío automáticamente">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="weight_grams" className="mb-1 block text-sm font-medium text-zinc-300">Peso (gramos)</label>
            <input id="weight_grams" name="weight_grams" type="number" min="0" value={weightGrams} onChange={(e) => setWeightGrams(e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-400 focus:outline-none" placeholder="250" />
          </div>
          <div>
            <label htmlFor="width_cm" className="mb-1 block text-sm font-medium text-zinc-300">Ancho (cm)</label>
            <input id="width_cm" name="width_cm" type="number" min="0" step="0.1" value={widthCm} onChange={(e) => setWidthCm(e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-400 focus:outline-none" placeholder="15" />
          </div>
          <div>
            <label htmlFor="height_cm" className="mb-1 block text-sm font-medium text-zinc-300">Alto (cm)</label>
            <input id="height_cm" name="height_cm" type="number" min="0" step="0.1" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-400 focus:outline-none" placeholder="20" />
          </div>
          <div>
            <label htmlFor="depth_cm" className="mb-1 block text-sm font-medium text-zinc-300">Largo (cm)</label>
            <input id="depth_cm" name="depth_cm" type="number" min="0" step="0.1" value={depthCm} onChange={(e) => setDepthCm(e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-400 focus:outline-none" placeholder="25" />
          </div>
        </div>
      </Section>

      {/* ─── Imagen y emoji ─── */}
      <Section
        icon={<svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>}
        title="Imagen y emoji"
        hint="Subí hasta 3 fotos. La primera es la portada"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-5">
            <div>
              <p className={labelClass}>Foto principal (portada)</p>
              <div className="flex flex-col gap-2">
                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-400 transition-colors hover:border-amber-400/60 hover:text-amber-300">
                  <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <path d="m17 8-5-5-5 5" />
                    <path d="M12 3v12" />
                  </svg>
                  {imageData ? "Cambiar imagen" : "Subir imagen"}
                  <input type="file" accept="image/*" className="sr-only" onChange={handlePrimaryImageUpload} />
                </label>
                {preview ? (
                  <button type="button" onClick={clearPrimaryImage} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-700 px-4 py-2 text-xs text-zinc-400 transition-colors hover:border-red-500/50 hover:text-red-400">
                    Quitar imagen
                  </button>
                ) : null}
              </div>
              <p className="mt-2 text-xs text-zinc-500">La foto se comprime automáticamente.</p>
            </div>
            <input type="hidden" name="imageData" value={imageData} />
            <div>
              <label htmlFor="image" className={labelClass}>O pegá una URL</label>
              <input id="image" name="image" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className={`${inputClass} font-mono text-xs`} placeholder="https://.../foto.jpg" />
            </div>
            <div>
              <label htmlFor="emoji" className={labelClass}>Emoji (placeholder)</label>
              <input id="emoji" name="emoji" type="text" value={emoji} onChange={(e) => setEmoji(e.target.value)} className={`${inputClass} text-center text-lg`} placeholder="📦" />
            </div>
          </div>
          <div className="space-y-5">
            <PhotoSlot slot={2} label="Foto 2 (opcional)" initial={product?.images?.[0]} />
            <PhotoSlot slot={3} label="Foto 3 (opcional)" initial={product?.images?.[1]} />
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-xs text-zinc-500">
              💡 Las fotos extra se muestran en la galería del producto.
            </div>
          </div>
          <ProductPreview name={name} category={category} price={price} stock={stock} emoji={emoji} image={preview} description={description} featured={featured} />
        </div>
      </Section>

      {/* ─── Descripción y detalles ─── */}
      <Section
        icon={<svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" /></svg>}
        title="Descripción y detalles"
        hint="Descripción corta y lista de características"
      >
        <div className="grid grid-cols-1 gap-5">
          <div>
            <label htmlFor="description" className={labelClass}>Descripción</label>
            <textarea id="description" name="description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} placeholder="Descripción corta del producto..." />
          </div>
          <div>
            <label htmlFor="details" className={labelClass}>Detalles (uno por línea)</label>
            <textarea id="details" name="details" rows={5} defaultValue={product?.details.join("\n") ?? ""} className={`${inputClass} font-mono`} placeholder={"Sombras Shadow Collection\nProyección en alta definición\nIncluye luz LED"} />
          </div>
        </div>
      </Section>

      {/* ─── Publicación ─── */}
      <Section
        icon={<svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" /><circle cx="7.5" cy="7.5" r="0.5" fill="currentColor" /></svg>}
        title="Publicación"
        hint="Etiquetas y visibilidad en la home"
      >
        <div className="grid grid-cols-1 gap-5">
          <div>
            <label htmlFor="tags" className={labelClass}>Etiquetas (separadas por coma)</label>
            <input id="tags" name="tags" type="text" defaultValue={product?.tags.join(", ") ?? ""} className={inputClass} placeholder="lampara, shadow collection, anime" />
          </div>
          {category !== "mystery-box" && (
            <div className="max-w-xs">
              <label htmlFor="rarity" className={labelClass}>Rareza (mystery box)</label>
              <select id="rarity" name="rarity" defaultValue={product ? parseMysteryRarity(product.tags) : "comun"} className={inputClass}>
                {mysteryRarityOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label} · {option.weight}%</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-zinc-500">Define qué tan difícil es que salga en una caja sorpresa.</p>
            </div>
          )}
          <label className="inline-flex w-fit cursor-pointer items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-300">
            <input type="checkbox" name="featured" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-4 w-4 rounded border-zinc-600 bg-zinc-950 accent-amber-400" />
            Destacado en el inicio
          </label>
        </div>
      </Section>

      {/* ─── Drop (condicional) ─── */}
      {category === "drops" && (
        <Section
          icon={<svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>}
          title="Ventana del drop"
          hint="El drop está activo entre estas fechas"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="dropStartsAt" className={labelClass}>Inicio del drop</label>
              <input id="dropStartsAt" name="dropStartsAt" type="datetime-local" value={dropStartsAt} onChange={(e) => setDropStartsAt(e.target.value)} className={`${inputClass} font-mono`} />
            </div>
            <div>
              <label htmlFor="dropEndsAt" className={labelClass}>Fin del drop</label>
              <input id="dropEndsAt" name="dropEndsAt" type="datetime-local" value={dropEndsAt} onChange={(e) => setDropEndsAt(e.target.value)} className={`${inputClass} font-mono`} />
            </div>
          </div>
          <div className="mt-5 max-w-xs">
            <label htmlFor="dropUnits" className={labelClass}>Unidades numeradas (total)</label>
            <input id="dropUnits" name="dropUnits" type="number" min="0" step="1" value={dropUnits} onChange={(e) => setDropUnits(e.target.value)} className={`${inputClass} tabular-nums`} placeholder="Ej: 10" />
          </div>
        </Section>
      )}

      {/* ─── Mystery Box (condicional) ─── */}
      {category === "mystery-box" && (
        <Section
          icon={<svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2.5 12h19" /><path d="M2.5 12a9.5 9.5 0 0 1 5-8.4M21.5 12a9.5 9.5 0 0 0-5-8.4" /><path d="M12 3.5V21" /><path d="M12 21a9.5 9.5 0 0 0 9.5-9.5" /><path d="M12 21a9.5 9.5 0 0 1-9.5-9.5" /></svg>}
          title="Piezas de la caja"
          hint="Sumá las piezas que integran esta caja"
        >
          <BoxIncludesEditor categories={categories} allProducts={allProducts} productId={product?.id} initialIncludes={initialBoxIncludes} />
        </Section>
      )}

      {/* ─── Actions ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-6 py-4">
        <p className="text-xs text-zinc-500">Los cambios se publican de inmediato.</p>
        <div className="flex flex-wrap items-center gap-3">
          <Link href={backHref} className="rounded-full border border-zinc-700 px-6 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500">
            Cancelar
          </Link>
          <button type="submit" disabled={pending} className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-7 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60">
            {pending ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9" /></svg>
                Guardando...
              </>
            ) : product ? "Guardar cambios" : "Crear producto"}
          </button>
        </div>
      </div>
    </form>
  );
}
