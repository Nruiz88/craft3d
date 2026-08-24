import { categoryById } from ".";
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

export type CatalogAvailability = "all" | "in-stock" | "out-of-stock";

export interface CatalogFilters {
  categories?: string[];
  priceMin?: number;
  priceMax?: number;
  availability?: CatalogAvailability;
}

export function filterByCategory(
  products: Product[],
  categoryIds: string[],
): Product[] {
  if (!categoryIds.length) return products;
  return products.filter((p) => categoryIds.includes(p.category));
}

export function filterByPrice(
  products: Product[],
  min?: number,
  max?: number,
): Product[] {
  let result = products;
  if (min !== undefined && !isNaN(min)) {
    result = result.filter((p) => p.price >= min);
  }
  if (max !== undefined && !isNaN(max)) {
    result = result.filter((p) => p.price <= max);
  }
  return result;
}

export function filterByAvailability(
  products: Product[],
  availability: CatalogAvailability,
): Product[] {
  switch (availability) {
    case "in-stock":
      return products.filter((p) => p.stock > 0);
    case "out-of-stock":
      return products.filter((p) => p.stock <= 0);
    default:
      return products;
  }
}

export function applyFilters(
  products: Product[],
  filters: CatalogFilters,
): Product[] {
  let result = products;
  if (filters.categories?.length) {
    result = filterByCategory(result, filters.categories);
  }
  result = filterByPrice(result, filters.priceMin, filters.priceMax);
  if (filters.availability && filters.availability !== "all") {
    result = filterByAvailability(result, filters.availability);
  }
  return result;
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
