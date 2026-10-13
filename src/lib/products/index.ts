import type { Category, CategoryId } from "./types";

export const categories: Category[] = [
  {
    id: "anime",
    name: "Anime",
    emoji: "🍥",
    description:
      "Dragon Ball, Naruto, One Piece y más. Figuras de anime, cuadros decorativos y lámparas de tus series favoritas.",
  },
  {
    id: "gaming",
    name: "Gaming",
    emoji: "🎮",
    description:
      "League of Legends, Valorant, CS GO y más. Decoración gamer, figuras y accesorios para tu setup.",
  },
  {
    id: "cine-series",
    name: "Cine y Series",
    emoji: "🎬",
    description:
      "Marvel, Star Wars, DC Comics y más. Figuras y cuadros coleccionables de tus sagas favoritas.",
  },
  {
    id: "accesorios",
    name: "Accesorios",
    emoji: "🔑",
    description:
      "Llaveros personalizados, clickers, separadores, soportes y Dummy 13 con diseños de anime y gaming.",
  },
  {
    id: "drops",
    name: "Drops",
    emoji: "💧",
    description:
      "Ediciones limitadas de figuras y coleccionables de anime y gaming. Un solo tiraje; cuando se agota, no vuelve.",
  },
  {
    id: "mundial-2026",
    name: "Mundial 2026",
    emoji: "🏆",
    description:
      "Mates, cajas de figuritas y figuras del Mundial 2026 y la Selección Argentina.",
  },
  {
    id: "mystery-box",
    name: "Cajas Sorpresa",
    emoji: "🎁",
    description:
      "Cajas sorpresa de Craft3d: pagás un precio y te llega una pieza sorpresa al azar de la categoría elegida.",
  },
];

export const categoryById: Record<CategoryId, Category> = Object.fromEntries(
  categories.map((c) => [c.id, c]),
) as Record<CategoryId, Category>;

/** Maps a category ID to its landing page URL */
export function categoryLandingUrl(categoryId: string): string {
  const landingPages: Record<string, string> = {
    anime: "/anime",
    gaming: "/gaming",
    "cine-series": "/cine-series",
    accesorios: "/accesorios",
    drops: "/drops",
    "mundial-2026": "/mundial-2026",
    "mystery-box": "/mysterybox",
  };
  return landingPages[categoryId] ?? "/catalogo";
}
