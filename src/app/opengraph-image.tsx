import { ImageResponse } from "next/og";

export const alt = "Craft3d — Impresión 3D y Arte en Filamento";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";

const grid = {
  position: "absolute",
  inset: 0,
  backgroundImage:
    "linear-gradient(rgba(34,211,238,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.07) 1px, transparent 1px)",
  backgroundSize: "48px 48px",
} as const;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0f",
          color: "#e4e4e7",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
          padding: "64px 72px",
        }}
      >
        <div style={grid} />

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 34,
              height: 34,
              background: "#fbbf24",
              borderRadius: 6,
              boxShadow: "0 0 28px rgba(251,191,36,0.65)",
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 42,
              fontWeight: 800,
              letterSpacing: 10,
              color: "#fafafa",
            }}
          >
            CRAFT<span style={{ color: "#fbbf24" }}>3D</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.02,
              color: "#fafafa",
              maxWidth: 980,
            }}
          >
            Figuras de anime, llaveros y regalos gamer
          </div>
          <div style={{ fontSize: 30, fontWeight: 600, color: "#a1a1aa" }}>
            Dragon Ball · Naruto · One Piece · Gaming · Coleccionables
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "4px solid #27272a",
            paddingTop: 26,
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 3,
              color: "#e879f9",
            }}
          >
            ★ HECHO CAPA A CAPA
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: 2,
              color: "#71717a",
            }}
          >
            CRAFT3D.COM.AR
          </div>
        </div>
      </div>
    ),
    size,
  );
}
