import type { Category, CategoryId } from "./types";

export const categories: Category[] = [
  {
    id: "anime",
    name: "Anime",
    emoji: "🍥",
    description:
      "Dragon Ball, Naruto, One Piece y más. Figuras, lámparas y piezas únicas de tus series favoritas.",
  },
  {
    id: "gaming",
    name: "Gaming",
    emoji: "🎮",
    description:
      "League of Legends, Valorant, CS GO y todo lo que le falta a tu setup gamer para ser único.",
  },
  {
    id: "cine-series",
    name: "Cine y Series",
    emoji: "🎬",
    description:
      "Marvel, Star Wars, DC Comics y personajes del universo del entretenimiento en formato coleccionable.",
  },
  {
    id: "accesorios",
    name: "Accesorios",
    emoji: "🔑",
    description:
      "Soportes, Dummy 13, clickers y bookmarks. Piezas útiles y con personalidad para el día a día.",
  },
  {
    id: "drops",
    name: "Drops",
    emoji: "💧",
    description:
      "Drops exclusivos de Craft3d: ediciones numeradas con un solo tiraje. Cuando se agota, no se vuelve a imprimir.",
  },
  {
    id: "mundial-2026",
    name: "Mundial 2026",
    emoji: "🏆",
    description:
      "Colección Copa del Mundo 2026: mates, fanáticos y piezas para vivir la pasión de la Selección.",
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
