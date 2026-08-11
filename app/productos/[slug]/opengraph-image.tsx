import { ImageResponse } from "next/og";
import { categoryById } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { getProductBySlug } from "@/lib/store";

export const alt = "Craft3d — Impresión 3D y Arte en Filamento";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const grid = {
  position: "absolute",
  inset: 0,
  backgroundImage:
    "linear-gradient(rgba(34,211,238,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.07) 1px, transparent 1px)",
  backgroundSize: "48px 48px",
} as const;

const panel = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  border: "2px solid #fbbf24",
  borderRadius: 8,
  padding: "22px 26px",
} as const;

export default async function ProductOpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const category = product ? categoryById[product.category] : undefined;

  const name = product?.name ?? "Producto no encontrado";
  const nameFont =
    name.length > 42 ? 42 : name.length > 26 ? 52 : 60;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0a0a0f",
          color: "#e4e4e7",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={grid} />

        {/* Barra superior */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "38px 52px 0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 24,
                height: 24,
                background: "#fbbf24",
                borderRadius: 4,
                boxShadow: "0 0 20px rgba(251,191,36,0.6)",
              }}
            />
            <div
              style={{
                display: "flex",
                fontSize: 30,
                fontWeight: 800,
                letterSpacing: 6,
                color: "#fafafa",
              }}
            >
              CRAFT<span style={{ color: "#fbbf24" }}>3D</span>
            </div>
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: 3,
              color: "#a1a1aa",
            }}
          >
            IMPRESIÓN 3D · ARTE EN FILAMENTO
          </div>
        </div>

        {/* Contenido */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 44,
            flex: 1,
            padding: "0 52px",
          }}
        >
          {/* Emoji en marco */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 230,
              height: 230,
              flexShrink: 0,
              borderRadius: 12,
              border: "4px solid #3f3f46",
              background: "#18181b",
              fontSize: 130,
              lineHeight: 1,
            }}
          >
            {product?.emoji ?? "🖨️"}
          </div>

          {/* Texto */}
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {category ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  alignSelf: "flex-start",
                  gap: 10,
                  border: "2px solid #3f3f46",
                  borderRadius: 6,
                  padding: "10px 18px",
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: 2,
                  color: "#22d3ee",
                }}
              >
                <span>{category.emoji}</span>
                <span>{category.name.toUpperCase()}</span>
              </div>
            ) : null}
            <div
              style={{
                fontSize: nameFont,
                fontWeight: 800,
                lineHeight: 1.05,
                color: "#fafafa",
                maxWidth: 720,
              }}
            >
              {name}
            </div>
            <div style={panel}>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  letterSpacing: 3,
                  color: "#a1a1aa",
                }}
              >
                PRECIO · AR$
              </div>
              <div
                style={{
                  fontSize: 44,
                  fontWeight: 800,
                  color: "#fbbf24",
                }}
              >
                {product ? formatPrice(product.price) : "—"}
              </div>
            </div>
          </div>
        </div>

        {/* Barra inferior */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "4px solid #27272a",
            padding: "24px 52px 34px",
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 3,
              color: "#e879f9",
            }}
          >
            ★ HECHO CAPA A CAPA
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: 2,
              color: "#71717a",
            }}
          >
            CRAFT3D.COM
          </div>
        </div>
      </div>
    ),
    size,
  );
}
