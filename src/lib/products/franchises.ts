import type { ThemedLandingConfig } from "@/components/catalog/themed-landing";
import type { Product } from "@/lib/products/types";

export interface FranchiseDef {
  id: string; // slug de la URL: /dragon-ball
  name: string;
  emoji: string;
  tag: string; // tag exacto guardado en el producto
  keywords: RegExp;
  heroGradient: string;
  accentBorder: string;
  accentBg: string;
  accentText: string;
  glowColor: string;
  description: string;
  longDescription: string;
  chips: string[];
}

export const franchises: FranchiseDef[] = [
  {
    id: "dragon-ball",
    name: "Dragon Ball",
    emoji: "🐉",
    tag: "dragon-ball",
    keywords: /\bdragon ball\b|goku|vegeta|freeza|frieza|\bcell\b|piccolo|esferas? del drag/i,
    heroGradient: "linear-gradient(135deg, #1a0f00 0%, #2e1a00 30%, #4e2f00 60%, #1a0f00 100%)",
    accentBorder: "border-orange-400/40",
    accentBg: "bg-orange-400/10",
    accentText: "text-orange-300",
    glowColor: "rgb(251,146,60)",
    description: "Figuras, cuadros y lámparas de Dragon Ball.",
    longDescription:
      "Figuras, cuadros y lámparas de Dragon Ball: Goku, Vegeta, Freeza, Cell y más. La colección para fans de Dragon Ball Z y Super, con envío a todo el país.",
    chips: ["GOKU", "VEGETA", "FREEZA", "CELL", "PICCOLO", "ESFERAS DEL DRAGÓN"],
  },
  {
    id: "naruto",
    name: "Naruto",
    emoji: "🍥",
    tag: "naruto",
    keywords: /naruto|kakashi|zabuza|sasuke|itachi/i,
    heroGradient: "linear-gradient(135deg, #1a0a00 0%, #2e1400 30%, #4e2500 60%, #1a0a00 100%)",
    accentBorder: "border-amber-400/40",
    accentBg: "bg-amber-400/10",
    accentText: "text-amber-300",
    glowColor: "rgb(251,191,36)",
    description: "Figuras, cuadros y llaveros de Naruto.",
    longDescription:
      "Figuras, cuadros y llaveros de Naruto Shippuden: Naruto, Kakashi, Sasuke, Zabuza y más. Regalos para fans del ninja más famoso, con envío a todo el país.",
    chips: ["NARUTO", "KAKASHI", "SASUKE", "ZABUZA", "SHIPPUDEN"],
  },
  {
    id: "one-piece",
    name: "One Piece",
    emoji: "🏴‍☠️",
    tag: "one-piece",
    keywords: /one piece|luffy|zoro|jimbe|gear 5|mugiwara/i,
    heroGradient: "linear-gradient(135deg, #001018 0%, #001f2e 30%, #00384e 60%, #001018 100%)",
    accentBorder: "border-sky-400/40",
    accentBg: "bg-sky-400/10",
    accentText: "text-sky-300",
    glowColor: "rgb(56,189,248)",
    description: "Figuras, cuadros y lámparas de One Piece.",
    longDescription:
      "Figuras, cuadros, lámparas y llaveros de One Piece: Luffy Gear 5, Zoro, Jimbe y más. Regalos para fans de los Mugiwara, con envío a todo el país.",
    chips: ["LUFFY", "ZORO", "JIMBE", "GEAR 5", "MUGIWARA"],
  },
  {
    id: "pokemon",
    name: "Pokémon",
    emoji: "⚡",
    tag: "pokemon",
    keywords: /pok[eé]mon|pikachu|charizard|mewtwo|eevee/i,
    heroGradient: "linear-gradient(135deg, #1a1400 0%, #2e2400 30%, #4e3c00 60%, #1a1400 100%)",
    accentBorder: "border-yellow-400/40",
    accentBg: "bg-yellow-400/10",
    accentText: "text-yellow-300",
    glowColor: "rgb(250,204,21)",
    description: "Figuras, cuadros y lámparas de Pokémon.",
    longDescription:
      "Figuras, cuadros y lámparas de Pokémon: Pikachu, Charizard, Mewtwo y más. Regalos para fans y coleccionistas, con envío a todo el país.",
    chips: ["PIKACHU", "CHARIZARD", "MEWTWO", "KANTO"],
  },
  {
    id: "demon-slayer",
    name: "Demon Slayer",
    emoji: "🗡️",
    tag: "demon-slayer",
    keywords: /demon slayer|kimetsu|tanjiro|inosuke|rengoku|shinobu|sanemi|tomioka|mitsuri|obanai|nezuko|giyu/i,
    heroGradient: "linear-gradient(135deg, #001412 0%, #002420 30%, #00413a 60%, #001412 100%)",
    accentBorder: "border-teal-400/40",
    accentBg: "bg-teal-400/10",
    accentText: "text-teal-300",
    glowColor: "rgb(45,212,191)",
    description: "Cuadros y figuras de Demon Slayer.",
    longDescription:
      "Cuadros y figuras de Demon Slayer (Kimetsu no Yaiba): Tanjiro, Rengoku, Shinobu, Inosuke y más. Regalos para fans del anime, con envío a todo el país.",
    chips: ["TANJIRO", "RENGOKU", "SHINOBU", "INOSUKE", "NEZUKO"],
  },
  {
    id: "jujutsu-kaisen",
    name: "Jujutsu Kaisen",
    emoji: "👁️",
    tag: "jujutsu-kaisen",
    keywords: /jujutsu|gojo|itadori|sukuna|yuta/i,
    heroGradient: "linear-gradient(135deg, #0f0018 0%, #1a0030 30%, #2d0050 60%, #0f0018 100%)",
    accentBorder: "border-violet-400/40",
    accentBg: "bg-violet-400/10",
    accentText: "text-violet-300",
    glowColor: "rgb(167,139,250)",
    description: "Figuras y cuadros de Jujutsu Kaisen.",
    longDescription:
      "Figuras y cuadros de Jujutsu Kaisen: Gojo, Itadori, Sukuna y más. Regalos para fans del anime, con envío a todo el país.",
    chips: ["GOJO", "ITADORI", "SUKUNA", "YUTA"],
  },
];

export const franchiseById: Record<string, FranchiseDef> = Object.fromEntries(
  franchises.map((f) => [f.id, f]),
);

export function franchiseConfig(f: FranchiseDef): ThemedLandingConfig {
  return {
    id: f.id,
    name: f.name,
    emoji: f.emoji,
    description: f.description,
    longDescription: f.longDescription,
    heroGradient: f.heroGradient,
    accentColor: f.glowColor,
    accentBorder: f.accentBorder,
    accentBg: f.accentBg,
    accentText: f.accentText,
    glowColor: f.glowColor,
    heroGlyph: f.emoji,
    tags: f.chips,
    catalogHref: "/catalogo",
    features: [
      {
        icon: "🎴",
        title: `Solo de ${f.name}`,
        desc: `Todo lo de ${f.name} reunido en una sola colección.`,
      },
      {
        icon: "🚚",
        title: "Envío a todo el país",
        desc: "Despachamos a toda Argentina y coordinamos el envío por WhatsApp.",
      },
      {
        icon: "🎁",
        title: "Ideal para regalar",
        desc: `El regalo perfecto para un fan de ${f.name}.`,
      },
    ],
  };
}

export function filterFranchise(products: Product[], f: FranchiseDef): Product[] {
  return products.filter((p) => {
    if (Array.isArray(p.tags) && p.tags.includes(f.tag)) return true;
    return f.keywords.test(`${p.name} ${p.description}`);
  });
}
