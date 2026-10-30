import { readFile } from "fs/promises";
import { join, extname } from "path";
import { uploadsDir, safeUploadName, UPLOAD_CONTENT_TYPE } from "@/lib/uploads";

export const runtime = "nodejs";

/** Sirve las imágenes subidas desde la carpeta de uploads (hosting propio). */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const safe = safeUploadName(name);
  if (!safe) return new Response("Not found", { status: 404 });

  try {
    const buf = await readFile(join(uploadsDir(), safe));
    const type = UPLOAD_CONTENT_TYPE[extname(safe).toLowerCase()] ?? "application/octet-stream";
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
