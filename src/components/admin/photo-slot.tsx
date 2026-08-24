"use client";

import { useRef, useState } from "react";
import { inputClass, labelClass, fileToDataUrl } from "./form-helpers";

export default function PhotoSlot({
  slot,
  label,
  hint,
  initial,
}: {
  slot: number;
  label: string;
  hint?: string;
  initial?: string;
}) {
  const suffix = slot === 1 ? "" : String(slot);
  const [data, setData] = useState(
    initial && initial.startsWith("data:") ? initial : "",
  );
  const [url, setUrl] = useState(
    initial && !initial.startsWith("data:") ? initial : "",
  );
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await fileToDataUrl(file);
      setData(result);
      setUrl("");
    } catch {
      // Imagen inválida
    }
    e.target.value = "";
  }

  function clearImage() {
    setData("");
    setUrl("");
    if (fileRef.current) fileRef.current.value = "";
  }

  const preview = data || url;

  return (
    <div>
      <p className={labelClass}>{label}</p>
      <div className="flex items-center gap-2">
        <label className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-400 transition-colors hover:border-amber-400/60 hover:text-amber-300">
          <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <path d="m17 8-5-5-5 5" />
            <path d="M12 3v12" />
          </svg>
          {preview ? "Cambiar imagen" : "Subir imagen"}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileUpload}
          />
        </label>
        {preview ? (
          <button
            type="button"
            onClick={clearImage}
            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-zinc-700 px-3 py-2.5 text-xs text-zinc-400 transition-colors hover:border-red-500/50 hover:text-red-400"
          >
            Quitar
          </button>
        ) : null}
      </div>

      <input type="hidden" name={`imageData${suffix}`} value={data} />

      <div className="mt-3 flex items-start gap-3">
        <div className="flex-1">
          <label htmlFor={`image${suffix}`} className={`${labelClass} !mb-1 text-xs`}>
            O pegá una URL
          </label>
          <input
            id={`image${suffix}`}
            name={`image${suffix}`}
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={`${inputClass} font-mono text-xs`}
            placeholder="https://.../foto.jpg"
          />
        </div>
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt=""
            className="h-16 w-16 shrink-0 rounded-lg border border-zinc-800 bg-zinc-950 object-cover"
          />
        ) : (
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-950/60 text-xl text-zinc-700">
            📷
          </span>
        )}
      </div>

      {hint ? <p className="mt-2 text-xs text-zinc-500">{hint}</p> : null}
    </div>
  );
}
