"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getEditablePages,
  saveEditablePage,
  deleteEditablePage,
  type EditablePage,
  type PageSection,
} from "@/app/admin/actions/pages";
import ConfirmDialog from "./confirm-dialog";

const inputClass =
  "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/20";
const labelClass = "mb-1 block text-xs font-medium text-zinc-400";

export default function PagesManager() {
  const [pages, setPages] = useState<EditablePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const data = await getEditablePages();
    setPages(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const page = editing ? pages.find((p) => p.slug === editing) : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Páginas editables</h1>
          <p className="text-sm text-zinc-500">
            Contenido estático editable desde el admin (Quiénes somos, Cómo comprar, etc.)
          </p>
        </div>
        <button
          onClick={() => { setShowNew(true); setEditing(null); }}
          className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-300"
        >
          + Nueva página
        </button>
      </div>

      {(showNew || editing) && (
        <PageForm
          initial={page}
          onSave={async (data) => {
            await saveEditablePage(data);
            setShowNew(false);
            setEditing(null);
            load();
          }}
          onCancel={() => { setShowNew(false); setEditing(null); }}
        />
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-zinc-900" />
          ))}
        </div>
      ) : pages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center">
          <p className="text-4xl" aria-hidden="true">📄</p>
          <p className="mt-3 text-sm text-zinc-500">No hay páginas creadas</p>
          <p className="mt-1 text-xs text-zinc-600">
            Creá páginas como &quot;Quiénes somos&quot; o &quot;Cómo comprar&quot;
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pages.map((p) => (
            <div key={p.slug} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 transition-colors hover:border-zinc-700">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-zinc-200">{p.title}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${p.published ? "bg-emerald-500/10 text-emerald-300" : "bg-zinc-700 text-zinc-400"}`}>
                    {p.published ? "PUBLICADA" : "BORRADOR"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-500">/{p.slug} · {p.content.length} secciones</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link href={`/info/${p.slug}`} target="_blank" className="rounded-lg px-2 py-1 text-xs text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300">Ver ↗</Link>
                <button onClick={() => { setEditing(p.slug); setShowNew(false); }} className="rounded-lg px-2 py-1 text-xs text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300">Editar</button>
                <button onClick={() => setDeleteTarget(p.slug)} className="rounded-lg px-2 py-1 text-xs text-zinc-500 transition-colors hover:bg-red-950/30 hover:text-red-400">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog open title="Eliminar página" message={`¿Eliminar la página "${deleteTarget}"?`} confirmLabel="Eliminar" danger onConfirm={async () => { await deleteEditablePage(deleteTarget); setDeleteTarget(null); load(); }} onCancel={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}

function PageForm({ initial, onSave, onCancel }: {
  initial?: EditablePage;
  onSave: (data: { slug: string; title: string; subtitle: string; content: PageSection[]; published: boolean }) => Promise<void>;
  onCancel: () => void;
}) {
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [sections, setSections] = useState<PageSection[]>(initial?.content && initial.content.length > 0 ? initial.content : [{ heading: "", body: "" }]);
  const [published, setPublished] = useState(initial?.published ?? true);
  const [saving, setSaving] = useState(false);

  function addSection() { setSections([...sections, { heading: "", body: "" }]); }
  function removeSection(i: number) { setSections(sections.filter((_, idx) => idx !== i)); }
  function updateSection(i: number, field: "heading" | "body", value: string) {
    setSections(sections.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave({ slug, title, subtitle, content: sections.filter((s) => s.body.trim()), published });
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-5">
      <h3 className="text-sm font-semibold text-zinc-200">{initial ? `Editar: ${initial.title}` : "Nueva página"}</h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Slug (URL)</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} disabled={!!initial} required className={`${inputClass} lowercase ${initial ? "opacity-50" : ""}`} placeholder="quienes-somos" />
        </div>
        <div>
          <label className={labelClass}>Título</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClass} placeholder="Quiénes somos" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Subtítulo</label>
        <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className={inputClass} placeholder="Conocé la historia de Craft3d" />
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-400">
        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4 rounded border-zinc-700 bg-zinc-950" />
        Publicada
      </label>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-medium text-zinc-400">SECCIONES</h4>
          <button type="button" onClick={addSection} className="text-xs text-amber-300 hover:text-amber-200">+ Agregar sección</button>
        </div>

        {sections.map((section, i) => (
          <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-600">SECCIÓN {String(i + 1).padStart(2, "0")}</span>
              {sections.length > 1 && <button type="button" onClick={() => removeSection(i)} className="text-[10px] text-red-400 hover:text-red-300">Eliminar</button>}
            </div>
            <input value={section.heading} onChange={(e) => updateSection(i, "heading", e.target.value)} className={inputClass} placeholder="Encabezado (opcional)" />
            <textarea value={section.body} onChange={(e) => updateSection(i, "body", e.target.value)} required rows={4} className={`${inputClass} resize-y`} placeholder="Contenido HTML permitido: p, strong, em, ul, li, a, h3" />
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="rounded-full bg-amber-400 px-6 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-300 disabled:opacity-50">
          {saving ? "Guardando..." : initial ? "Guardar cambios" : "Crear página"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-full border border-zinc-700 px-6 py-2 text-sm text-zinc-400 transition-colors hover:text-zinc-200">
          Cancelar
        </button>
      </div>
    </form>
  );
}
