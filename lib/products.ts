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
    id: "ediciones-limitadas",
    name: "Ediciones Limitadas",
    emoji: "⭐",
    description:
      "Drops exclusivos de productos limitados. Cuando se agota, no se vuelve a imprimir.",
  },
  {
    id: "mundial-2026",
    name: "Mundial 2026",
    emoji: "🏆",
    description:
      "Colección Copa del Mundo 2026: mates, fanáticos y piezas para vivir la pasión de la Selección.",
  },
];

export const categoryById: Record<CategoryId, Category> = Object.fromEntries(
  categories.map((c) => [c.id, c]),
) as Record<CategoryId, Category>;
