export const inputClass =
  "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none";

export const labelClass = "mb-1.5 block text-sm font-medium text-zinc-300";

export function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Redimensiona (máx 1600px) y comprime a un Blob WebP para subir al servidor. */
function resizeToWebpBlob(file: File, max = 1600, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > max || height > max) {
          const scale = max / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas no disponible"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("No se pudo procesar"))),
          "image/webp",
          quality,
        );
      };
      img.onerror = () => reject(new Error("Imagen inválida"));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(file);
  });
}

/** Sube una imagen al hosting propio y devuelve su URL (/uploads/...). */
export async function uploadProductImage(file: File): Promise<string> {
  const blob = await resizeToWebpBlob(file);
  const fd = new FormData();
  fd.append("file", blob, "foto.webp");
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || "No se pudo subir la imagen");
  }
  const { url } = (await res.json()) as { url: string };
  return url;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // 1600px de lado mayor + JPEG 0.85: buen equilibrio calidad/peso para
        // fichas de producto (suelen quedar entre 200-500KB por imagen).
        const MAX = 1600;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          const scale = MAX / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas no disponible"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => reject(new Error("Imagen inválida"));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(file);
  });
}
