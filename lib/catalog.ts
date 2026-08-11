import { categoryById } from "./products";
import type { Product } from "./types";

export type CatalogOrder =
  | "recientes"
  | "precio-asc"
  | "precio-desc"
  | "nombre-asc"
  | "nombre-desc";

export const catalogOrders: { value: CatalogOrder; label: string }[] = [
  { value: "recientes", label: "Más recientes" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "nombre-asc", label: "Nombre: A → Z" },
  { value: "nombre-desc", label: "Nombre: Z → A" },
];

export function isValidCatalogOrder(
  value: string | undefined,
): value is CatalogOrder {
  return (
    value !== undefined &&
    catalogOrders.some((order) => order.value === value)
  );
}

export function filterProductsByQuery(
  products: Product[],
  query: string,
): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return products;
  return products.filter((product) => {
    const categoryName = categoryById[product.category]?.name ?? "";
    const haystack = [
      product.name,
      product.slug,
      product.category,
      categoryName,
      product.description,
      ...product.tags,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function sortProducts(products: Product[], order?: string): Product[] {
  const list = [...products];
  switch (order as CatalogOrder) {
    case "precio-asc":
      return list.sort((a, b) => a.price - b.price);
    case "precio-desc":
      return list.sort((a, b) => b.price - a.price);
    case "nombre-asc":
      return list.sort((a, b) => a.name.localeCompare(b.name, "es"));
    case "nombre-desc":
      return list.sort((a, b) => b.name.localeCompare(a.name, "es"));
    default:
      return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}
