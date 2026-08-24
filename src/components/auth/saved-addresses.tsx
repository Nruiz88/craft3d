"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  migrateGuestAddresses,
  type SavedAddress,
} from "@/app/cuenta/actions/addresses";

const inputClass =
  "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/20";
const labelClass = "mb-1 block text-xs font-medium text-zinc-400";

export default function SavedAddresses() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const loadAddresses = useCallback(async () => {
    setLoading(true);
    const data = await getAddresses();
    setAddresses(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      // Migrar direcciones viejas de localStorage si existen
      try {
        const raw = localStorage.getItem("craft3d-addresses");
        if (raw) {
          const old = JSON.parse(raw);
          if (Array.isArray(old) && old.length > 0) {
            await migrateGuestAddresses(old);
            localStorage.removeItem("craft3d-addresses");
          }
        }
      } catch {
        // Ignorar errores de migración
      }
      loadAddresses();
    })();
  }, [loadAddresses]);

  async function handleCreate(
    data: Omit<SavedAddress, "id" | "isDefault" | "createdAt">,
  ) {
    const result = await createAddress(data);
    if (result.ok) {
      setShowForm(false);
      loadAddresses();
    }
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      await deleteAddress(id);
      loadAddresses();
    });
  }

  async function handleSetDefault(id: string) {
    startTransition(async () => {
      await setDefaultAddress(id);
      loadAddresses();
    });
  }

  async function handleUpdate(
    id: string,
    data: Omit<SavedAddress, "id" | "isDefault" | "createdAt">,
  ) {
    startTransition(async () => {
      await updateAddress(id, data);
      setEditing(null);
      loadAddresses();
    });
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-zinc-800 bg-zinc-950/40 p-4"
          >
            <div className="h-4 w-24 rounded bg-zinc-800" />
            <div className="mt-2 h-3 w-32 rounded bg-zinc-800" />
            <div className="mt-1 h-3 w-48 rounded bg-zinc-800" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {addresses.length > 0 && (
        <div className="space-y-3">
          {addresses.map((addr) =>
            editing === addr.id ? (
              <AddressForm
                key={addr.id}
                initial={addr}
                onSave={(data) => handleUpdate(addr.id, data)}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <div
                key={addr.id}
                className={`rounded-xl border p-4 transition-colors ${
                  addr.isDefault
                    ? "border-amber-400/40 bg-amber-400/5"
                    : "border-zinc-800 bg-zinc-950/40"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-200">
                        {addr.label}
                      </span>
                      {addr.isDefault && (
                        <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      {addr.name} · {addr.phone}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {addr.address}, {addr.city}, {addr.province} (
                      {addr.postalCode})
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => setEditing(addr.id)}
                      className="rounded-lg px-2 py-1 text-[10px] text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
                    >
                      Editar
                    </button>
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        disabled={isPending}
                        className="rounded-lg px-2 py-1 text-[10px] text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300 disabled:opacity-50"
                      >
                        Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(addr.id)}
                      disabled={isPending}
                      className="rounded-lg px-2 py-1 text-[10px] text-zinc-500 transition-colors hover:bg-red-950/30 hover:text-red-400 disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      )}

      {showForm ? (
        <AddressForm
          onSave={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-700 py-4 text-sm text-zinc-500 transition-colors hover:border-cyan-400/40 hover:text-cyan-300"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Agregar dirección
        </button>
      )}
    </div>
  );
}

function AddressForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: SavedAddress;
  onSave: (
    data: Omit<SavedAddress, "id" | "isDefault" | "createdAt">,
  ) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [province, setProvince] = useState(initial?.province ?? "");
  const [postalCode, setPostalCode] = useState(initial?.postalCode ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      label: label || "Mi dirección",
      name,
      phone,
      address,
      city,
      province,
      postalCode,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Etiqueta</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className={inputClass}
            placeholder="Casa, Trabajo..."
          />
        </div>
        <div>
          <label className={labelClass}>Nombre completo</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={inputClass}
            placeholder="Juan Pérez"
          />
        </div>
      </div>
      <div>
        <label className={labelClass}>Teléfono</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className={inputClass}
          placeholder="299 123 4567"
        />
      </div>
      <div>
        <label className={labelClass}>Dirección</label>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          className={inputClass}
          placeholder="Av. San Martín 1234, depto 2B"
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Ciudad</label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            className={inputClass}
            placeholder="Neuquén"
          />
        </div>
        <div>
          <label className={labelClass}>Provincia</label>
          <input
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            required
            className={inputClass}
            placeholder="Neuquén"
          />
        </div>
        <div>
          <label className={labelClass}>Código postal</label>
          <input
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            required
            className={inputClass}
            placeholder="8300"
          />
        </div>
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-300"
        >
          {initial ? "Actualizar" : "Guardar"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-zinc-700 px-5 py-2 text-sm text-zinc-400 transition-colors hover:text-zinc-200"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
