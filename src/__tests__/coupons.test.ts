import { describe, it, expect } from "vitest";
import { COIN_RATE, MIN_COINS_TO_REDEEM, REDEEM_OPTIONS, formatRedemptionCode } from "@/lib/orders/coupons";
import { slugify } from "@/lib/utils/slug";
import { getMysteryBoxIncludes, mysteryBoxIncludeTags, parseMysteryRarity } from "@/lib/mystery-box";
import { sanitizeString, sanitizeSlug, sanitizeNumber } from "@/lib/utils/sanitize";

describe("cupones - constantes de canje", () => {
  it("1 moneda equivale a $20", () => {
    expect(COIN_RATE).toBe(20);
  });

  it("el mínimo para canjear es 100 monedas", () => {
    expect(MIN_COINS_TO_REDEEM).toBe(100);
  });

  it("las opciones de canje son montos positivos crecientes", () => {
    for (let i = 1; i < REDEEM_OPTIONS.length; i++) {
      expect(REDEEM_OPTIONS[i].amount).toBeGreaterThan(REDEEM_OPTIONS[i - 1].amount);
    }
    expect(REDEEM_OPTIONS.every((opt) => opt.amount > 0)).toBe(true);
  });

  it("formatea el código en mayúsculas", () => {
    expect(formatRedemptionCode("craft-abc123")).toBe("CRAFT-ABC123");
  });
});

describe("utilidades de sanitización", () => {
  it("sanitiza strings con HTML", () => {
    expect(sanitizeString("<script>alert(1)</script>Hola")).not.toContain("<script>");
    expect(sanitizeString("Texto normal")).toBe("Texto normal");
  });

  it("sanitiza slugs", () => {
    expect(sanitizeSlug("ProductoEspecial2026")).toBe("productoespecial2026");
    expect(sanitizeSlug("Producto-Especial")).toBe("producto-especial");
    expect(sanitizeSlug("")).toBe("");
  });

  it("valida números con límites", () => {
    expect(sanitizeNumber("150", 0, 100)).toBe(100);
    expect(sanitizeNumber("abc")).toBe(null);
    expect(sanitizeNumber("5.5")).toBe(5.5);
  });
});

describe("slugify", () => {
  it("normaliza acentos y espacios", () => {
    expect(slugify("Múrcielago Ñandú")).toBe("murcielago-nandu");
  });
});

describe("mystery box - tags", () => {
  it("parsea includes con cantidad", () => {
    const includes = getMysteryBoxIncludes(["box-include:mate-a:2", "box-include:mate-b"]);
    expect(includes).toEqual([
      { slug: "mate-a", qty: 2 },
      { slug: "mate-b", qty: 1 },
    ]);
  });

  it("regenera tags de includes", () => {
    const tags = mysteryBoxIncludeTags([
      { slug: "mate-a", qty: 2 },
      { slug: "mate-b", qty: 1 },
    ]);
    expect(tags).toEqual(["box-include:mate-a:2", "box-include:mate-b"]);
  });

  it("parsea rarezas válidas y cae a común", () => {
    expect(parseMysteryRarity(["rarity:epica"])).toBe("epica");
    expect(parseMysteryRarity(["rarity:invalida"])).toBe("comun");
    expect(parseMysteryRarity([])).toBe("comun");
  });
});
