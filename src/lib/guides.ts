import type { Product } from "@/lib/products/types";
import { filterFranchise, franchiseById } from "@/lib/products/franchises";

export interface GuideLink {
  label: string;
  href: string;
}

export interface GuideSection {
  heading: string;
  body: string[];
  links?: GuideLink[];
}

export interface GuideSelect {
  /** categoria | franquicia | destacados */
  type: "categoria" | "franquicia" | "destacados";
  value?: string;
}

export interface Guide {
  slug: string;
  title: string;
  description: string;
  intro: string[];
  sections: GuideSection[];
  select: GuideSelect;
  ctaLabel: string;
  ctaHref: string;
  updated: string; // ISO
}

export const guides: Guide[] = [
  {
    slug: "regalos-para-fans-del-anime",
    title: "Regalos para fans del anime: ideas originales",
    description:
      "Ideas de regalos para fans del anime: figuras, cuadros decorativos, llaveros y coleccionables de Dragon Ball, Naruto, One Piece, Pokémon y más. Envío a todo el país.",
    intro: [
      "Encontrar el regalo perfecto para un fan del anime no siempre es fácil: ya tiene los pósters, ya vio todas las series y quiere algo distinto. La buena noticia es que hay piezas originales que no se consiguen en cualquier lado y que sorprenden de verdad.",
      "En esta guía te damos ideas para acertar siempre, ordenadas por tipo de pieza y por presupuesto.",
    ],
    sections: [
      {
        heading: "1. Figuras de anime",
        body: [
          "Las figuras son el regalo clásico que nunca falla. Buscá una figura del personaje favorito de esa persona y, si es articulada, mejor: se puede posar y queda bien en cualquier estantería.",
          "Si no sabés cuál personaje le gusta, las figuras de Dragon Ball, Naruto y One Piece son apuestas seguras. Los dummys articulados son ideales para quienes arman escenas o coleccionan.",
        ],
        links: [
          { label: "Ver figuras de anime", href: "/anime" },
          { label: "Ver todos los regalos", href: "/regalos" },
        ],
      },
      {
        heading: "2. Cuadros y decoración",
        body: [
          "Un cuadro del personaje favorito decora y queda increíble en la pared o detrás del escritorio. Es un regalo que se ve todos los días y que suele generar el mejor 'wow'.",
          "Para cuartos gamer, una lámpara o un cuadro con efecto de luz transforma el ambiente sin reformas.",
        ],
        links: [
          { label: "Cuadros y deco de anime", href: "/anime" },
          { label: "Decoración gamer", href: "/gaming" },
        ],
      },
      {
        heading: "3. Llaveros, clickers y accesorios",
        body: [
          "Si buscás algo económico pero con mucho sentido, los llaveros y accesorios son ideales: se usan todos los días y muestran la afición a la vista.",
          "Los clickers antiestrés y los separadores también funcionan perfecto como regalo de cumpleaños o Día del Amigo.",
        ],
        links: [{ label: "Ver llaveros y accesorios", href: "/accesorios" }],
      },
      {
        heading: "4. Cómo elegir el regalo correcto",
        body: [
          "Definí el personaje o la serie antes que la pieza: un fan valora más que sea de su personaje favorito que el tipo de objeto.",
          "Orientate por el uso: si va a colgarlo, un llavero; si va a mirarlo, un cuadro; si va a jugar con él, una figura.",
          "Y si dudás, los coleccionables de edición limitada siempre suman puntos.",
        ],
        links: [
          { label: "Coleccionables de edición limitada", href: "/drops" },
          { label: "Cajas sorpresa", href: "/mysterybox" },
        ],
      },
    ],
    select: { type: "categoria", value: "anime" },
    ctaLabel: "Ver todos los regalos",
    ctaHref: "/regalos",
    updated: "2026-10-13",
  },
  {
    slug: "regalos-gamer",
    title: "Regalos gamer originales para tu setup",
    description:
      "Los mejores regalos gamer: decoración, figuras y accesorios para el setup de un gamer. League of Legends, Valorant, CS GO y más. Envío a todo el país.",
    intro: [
      "Si la persona a la que le querés regalar ama los videojuegos, la decoración de su setup es un punto débil perfecto: siempre quiere sumar un detalle más.",
      "Estas son las ideas que mejor funcionan para regalar a un gamer.",
    ],
    sections: [
      {
        heading: "Decoración para el setup",
        body: [
          "Cuadros, figuras y lámparas temáticas elevan cualquier escritorio. Elegí el juego que más juega: League of Legends, Valorant, CS GO o Minecraft son los más pedidos.",
        ],
        links: [{ label: "Ver decoración gamer", href: "/gaming" }],
      },
      {
        heading: "Accesorios que usa todos los días",
        body: [
          "Soportes, organizadores y accesorios de escritorio combinan utilidad con diseño. Son los regalos que más se usan y menos ocupan lugar.",
        ],
        links: [{ label: "Ver accesorios", href: "/accesorios" }],
      },
      {
        heading: "Para fans de sagas y películas",
        body: [
          "Si además es fan de Star Wars, Marvel o superhéroes, los coleccionables de cine y series son infalibles.",
        ],
        links: [{ label: "Coleccionables de cine y series", href: "/cine-series" }],
      },
    ],
    select: { type: "categoria", value: "gaming" },
    ctaLabel: "Ver todos los regalos",
    ctaHref: "/regalos",
    updated: "2026-10-13",
  },
  {
    slug: "como-decorar-tu-cuarto-con-tematica-anime",
    title: "Cómo decorar tu cuarto con temática anime",
    description:
      "Ideas para decorar tu cuarto con temática anime: cuadros, figuras, lámparas y accesorios de tus series favoritas. Guía con ideas y productos para tu espacio.",
    intro: [
      "Decorar el cuarto con temática anime no es llenar las paredes de pósters: es elegir pocas piezas con impacto. Con un par de decisiones acertadas cambia todo el ambiente.",
      "Esta guía te da un orden simple para armar un rincón de anime que se vea prolijo y personal.",
    ],
    sections: [
      {
        heading: "Empezá por las paredes",
        body: [
          "Un cuadro grande del personaje favorito, o dos medianos juntos, ordenan visualmente la pared. Menos es más: mejor dos buenos que diez apretados.",
        ],
        links: [{ label: "Ver cuadros de anime", href: "/anime" }],
      },
      {
        heading: "La estantería de figuras",
        body: [
          "Agrupá las figuras por serie o por color. Las figuras articuladas quedan mejor en acción (posadas) que todas derechas.",
        ],
        links: [{ label: "Ver figuras", href: "/anime" }],
      },
      {
        heading: "Iluminación con onda",
        body: [
          "Una lámpara temática que proyecte la silueta de tu personaje le da un toque único de noche. Es el detalle que más cambia el cuarto.",
        ],
        links: [{ label: "Lámparas y deco", href: "/gaming" }],
      },
      {
        heading: "El escritorio",
        body: [
          "En el escritorio, sumá un accesorio útil: un clicker, un separador o un llavero en un llavero-stand. Práctico y temático a la vez.",
        ],
        links: [{ label: "Ver accesorios", href: "/accesorios" }],
      },
    ],
    select: { type: "categoria", value: "anime" },
    ctaLabel: "Ver todo anime",
    ctaHref: "/anime",
    updated: "2026-10-13",
  },
  {
    slug: "regalos-para-fans-de-dragon-ball",
    title: "Regalos para fans de Dragon Ball",
    description:
      "Ideas de regalos para fans de Dragon Ball: figuras, cuadros y lámparas de Goku, Vegeta, Freeza y más. Envío a todo el país.",
    intro: [
      "Dragon Ball es de esas franquicias que se viven de chico y no se sueltan nunca. Si le querés regalar a un fan, hay piezas que le van a volar la cabeza.",
      "Estas son las mejores opciones de la colección Dragon Ball.",
    ],
    sections: [
      {
        heading: "Los personajes más buscados",
        body: [
          "Goku, Vegeta, Freeza y Cell son los más pedidos. Un cuadro o una figura de cualquiera de ellos es apuesta segura.",
        ],
        links: [{ label: "Ver colección Dragon Ball", href: "/dragon-ball" }],
      },
      {
        heading: "Para el fan que lo tiene todo",
        body: [
          "Si ya tiene figuras, probá con una lámpara o un cuadro de edición limitada: piezas que no se reponen y que se ven espectaculares.",
        ],
        links: [
          { label: "Ediciones limitadas", href: "/drops" },
          { label: "Lámparas", href: "/dragon-ball" },
        ],
      },
    ],
    select: { type: "franquicia", value: "dragon-ball" },
    ctaLabel: "Ver todo Dragon Ball",
    ctaHref: "/dragon-ball",
    updated: "2026-10-13",
  },
  {
    slug: "regalos-para-fans-de-pokemon",
    title: "Regalos para fans de Pokémon",
    description:
      "Ideas de regalos para fans de Pokémon: figuras, cuadros y lámparas de Pikachu, Charizard, Mewtwo y más. Envío a todo el país.",
    intro: [
      "Pokémon es una afición que atraviesa generaciones. Del chico que empieza a jugar al coleccionista de años, siempre hay una pieza que encaja.",
      "Estas son nuestras recomendaciones para regalar a un fan de Pokémon.",
    ],
    sections: [
      {
        heading: "Pikachu y los clásicos",
        body: [
          "Pikachu, Charizard y Mewtwo son los preferidos. Un cuadro o una figura de estos personajes no falla nunca.",
        ],
        links: [{ label: "Ver colección Pokémon", href: "/pokemon" }],
      },
      {
        heading: "Para decorar el cuarto",
        body: [
          "Los cuadros grandes y las lámparas convierten la pared en un rincón temático en un solo paso.",
        ],
        links: [{ label: "Ver decoración", href: "/pokemon" }],
      },
    ],
    select: { type: "franquicia", value: "pokemon" },
    ctaLabel: "Ver todo Pokémon",
    ctaHref: "/pokemon",
    updated: "2026-10-13",
  },
];

export const guideBySlug: Record<string, Guide> = Object.fromEntries(
  guides.map((g) => [g.slug, g]),
);

export function selectGuideProducts(products: Product[], guide: Guide): Product[] {
  const { select } = guide;
  let list = products;
  if (select.type === "categoria" && select.value) {
    list = products.filter((p) => p.category === select.value);
  } else if (select.type === "franquicia" && select.value) {
    const f = franchiseById[select.value];
    list = f ? filterFranchise(products, f) : products;
  } else if (select.type === "destacados") {
    list = products.filter((p) => p.featured);
  }
  return [...list].sort(
    (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)),
  );
}
