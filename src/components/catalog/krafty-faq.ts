export type FaqItem = { q: string; a: string };

/**
 * Preguntas frecuentes de KRAFTY.
 * Fuente única: se muestran en la landing (/krafty) y alimentan el
 * FAQPage JSON-LD. Google exige que el texto del schema sea visible en la
 * página, por eso ambos salen de acá.
 * Pensadas para SEO (keywords de tendencia: "sin pantallas", "construcción",
 * "creativo/didáctico", "regalo de Navidad") y para responder las dudas que
 * frenan la compra (edad, seguridad).
 */
export const KRAFTY_FAQ: FaqItem[] = [
  {
    q: "¿Es un juguete sin pantallas?",
    a: "Sí, KRAFTY es 100% sin pantallas. Los chicos crean con sus propias manos cortando, marcando y uniendo cartón, lejos del celular y la tablet.",
  },
  {
    q: "¿Desde qué edad es?",
    a: "Está pensado desde los 4 años. Las herramientas son seguras y sin filo; con los más chicos recomendamos el acompañamiento de un adulto.",
  },
  {
    q: "¿Es seguro para los chicos?",
    a: "Sí. Las herramientas de KRAFTY no tienen filo y están diseñadas para que los chicos corten, marquen y unan cartón sin riesgo.",
  },
  {
    q: "¿Qué se puede construir?",
    a: "Castillos, cohetes, casas, máscaras, robots… lo que imaginen. Incluye manuales con proyectos paso a paso, pero la gracia es que inventen sus propias creaciones.",
  },
  {
    q: "¿Hace falta comprar cartón?",
    a: "No. KRAFTY funciona con cualquier caja o cartón que tengas en casa, así que se puede jugar una y otra vez sin gastar de más.",
  },
  {
    q: "¿Sirve como regalo de Navidad?",
    a: "Es un regalo ideal: creativo, didáctico y sin pantallas, de los que estimulan la imaginación. Hacemos envíos a todo el país para que llegue a tiempo.",
  },
];
