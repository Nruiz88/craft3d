import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { isAdmin } from "@/lib/auth";
import { uploadsDir } from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TYPE_EXT: Record<string, string> = {
  "image/webp": ".webp",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
};

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Falta el archivo" }, { status: 400 });
  }
  const ext = TYPE_EXT[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Formato no permitido (webp, jpg, png o gif)" },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Imagen demasiado grande (máx 8MB)" }, { status: 413 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const name = `${Date.now().toString(36)}-${randomUUID().slice(0, 8)}${ext}`;
  const dir = uploadsDir();
  try {
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, name), buf);
  } catch {
    return NextResponse.json({ error: "No se pudo guardar la imagen" }, { status: 500 });
  }

  return NextResponse.json({ url: `/uploads/${name}` });
}
