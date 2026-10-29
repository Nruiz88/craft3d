import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";
import { formatPrice } from "@/lib/utils/format";
import { getProductBySlug } from "@/lib/orders/store";

export const alt =
  "KRAFTY — Kit de herramientas para cartón · El regalo de Navidad · Craft3d";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function productPhoto(): string | null {
  try {
    const buf = readFileSync(
      join(process.cwd(), "public", "krafty", "producto-og.jpg"),
    );
    return `data:image/jpeg;base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export function kraftyOgResponse(price: number | null, photo: string | null) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #140d05 0%, #241708 55%, #130c04 100%)",
          color: "#f4ecdd",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -80,
            width: 420,
            height: 420,
            borderRadius: 420,
            background: "rgba(251,191,36,0.18)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -140,
            left: 260,
            width: 360,
            height: 360,
            borderRadius: 360,
            background: "rgba(232,102,122,0.14)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 48,
            flex: 1,
            padding: "0 64px",
          }}
        >
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              width={400}
              height={400}
              alt=""
              style={{
                width: 400,
                height: 400,
                objectFit: "cover",
                borderRadius: 20,
                border: "5px solid rgba(205,160,106,0.7)",
                flexShrink: 0,
              }}
            />
          ) : null}

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                border: "2px solid rgba(232,102,122,0.6)",
                borderRadius: 6,
                padding: "8px 16px",
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: 3,
                color: "#f0a0ac",
              }}
            >
              EDICIÓN NAVIDAD · CRAFT3D
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 110,
                fontWeight: 800,
                lineHeight: 1,
                color: "#fbbf24",
                letterSpacing: 2,
              }}
            >
              KRAFTY
            </div>
            <div
              style={{
                fontSize: 30,
                fontWeight: 600,
                color: "#e9ddc8",
                maxWidth: 560,
              }}
            >
              Kit de herramientas para cartón, seguras y sin filo.
            </div>
            {price != null ? (
              <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
                <span
                  style={{ fontSize: 22, fontWeight: 600, color: "#b7a789" }}
                >
                  DESDE
                </span>
                <span
                  style={{ fontSize: 56, fontWeight: 800, color: "#fbbf24" }}
                >
                  {formatPrice(price)}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "4px solid rgba(205,160,106,0.5)",
            padding: "22px 64px 30px",
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: 3,
              color: "#8fd3b4",
            }}
          >
            SIN FILO · PARA CHICOS · ENVÍO A TODO EL PAÍS
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: 2,
              color: "#b7a789",
            }}
          >
            CRAFT3D.COM.AR/KRAFTY
          </div>
        </div>
      </div>
    ),
    size,
  );
}

export default async function KraftyOpengraphImage() {
  let price: number | null = null;
  try {
    const product = await getProductBySlug("krafty");
    price = product?.price ?? null;
  } catch {
    price = null;
  }
  return kraftyOgResponse(price, productPhoto());
}
