"use client";

import { useState, useEffect } from "react";
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  type CouponData,
} from "@/app/admin/actions/coupons";
import ConfirmDialog from "./confirm-dialog";

const inputClass =
  "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/20";
const labelClass = "mb-1 block text-xs font-medium text-zinc-400";

export default function CouponsManager() {
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const data = await getCoupons();
    setCoupons(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(data: Parameters<typeof createCoupon>[0]) {
    const result = await createCoupon(data);
    if (result.ok) {
      setShowForm(false);
      load();
    } else {
      alert(result.error);
    }
  }

  async function handleUpdate(
    code: string,
    data: Parameters<typeof updateCoupon>[1],
  ) {
    const result = await updateCoupon(code, data);
    if (result.ok) {
      setEditing(null);
      load();
    } else {
      alert(result.error);
    }
  }

  async function handleDelete(code: string) {
    const result = await deleteCoupon(code);
    if (result.ok) {
      setDeleteTarget(null);
      load();
    } else {
      alert(result.error);
    }
  }

  const activeCoupons = coupons.filter(
    (c) => c.timesUsed < c.maxUses && (!c.expiresAt || new Date(c.expiresAt) > new Date()),
  );
  const usedCoupons = coupons.filter(
    (c) => c.timesUsed >= c.maxUses || (c.expiresAt && new Date(c.expiresAt) <= new Date()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Cupones</h1>
          <p className="text-sm text-zinc-500">
            {activeCoupons.length} activos · {usedCoupons.length} agotados/vencidos
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditing(null);
          }}
          className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-300"
        >
          + Nuevo cupón
        </button>
      </div>

      {/* Form */}
      {(showForm || editing) && (
        <CouponForm
          initial={editing ? coupons.find((c) => c.code === editing) : undefined}
          onSave={
            editing
              ? (data) => handleUpdate(editing, data)
              : handleCreate
          }
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Cupones activos"
          value={activeCoupons.length}
          color="text-emerald-400"
        />
        <StatCard
          label="Total canjeos"
          value={coupons.reduce((sum, c) => sum + c.timesUsed, 0)}
          color="text-cyan-400"
        />
        <StatCard
          label="Descuento total"
          value={`$${coupons.reduce((sum, c) => sum + c.timesUsed * c.value, 0).toLocaleString("es-AR")}`}
          color="text-amber-400"
        />
        <StatCard
          label="Agotados"
          value={usedCoupons.length}
          color="text-zinc-500"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl bg-zinc-900"
            />
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center">
          <p className="text-4xl" aria-hidden="true">🎫</p>
          <p className="mt-3 text-sm text-zinc-500">No hay cupones creados</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                <th className="px-4 py-3 font-medium text-zinc-400">Código</th>
                <th className="px-4 py-3 font-medium text-zinc-400">Tipo</th>
                <th className="px-4 py-3 font-medium text-zinc-400">Valor</th>
                <th className="px-4 py-3 font-medium text-zinc-400">Mínimo</th>
                <th className="px-4 py-3 font-medium text-zinc-400">Usos</th>
                <th className="px-4 py-3 font-medium text-zinc-400">Expira</th>
                <th className="px-4 py-3 font-medium text-zinc-400">Estado</th>
                <th className="px-4 py-3 font-medium text-zinc-400">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => {
                const isExpired =
                  coupon.expiresAt && new Date(coupon.expiresAt) <= new Date();
                const isExhausted = coupon.timesUsed >= coupon.maxUses;
                const isActive = !isExpired && !isExhausted;

                return (
                  <tr
                    key={coupon.code}
                    className="border-b border-zinc-800/50 transition-colors hover:bg-zinc-900/30"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-amber-300">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {coupon.kind === "percent" ? "Porcentaje" : "Fijo"}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      {coupon.kind === "percent"
                        ? `${coupon.value}%`
                        : `$${coupon.value.toLocaleString("es-AR")}`}
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {coupon.minSubtotal > 0
                        ? `$${coupon.minSubtotal.toLocaleString("es-AR")}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {coupon.timesUsed}/{coupon.maxUses}
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {coupon.expiresAt
                        ? new Date(coupon.expiresAt).toLocaleDateString("es-AR")
                        : "Sin límite"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isActive
                            ? "bg-emerald-500/10 text-emerald-300"
                            : isExpired
                              ? "bg-red-500/10 text-red-300"
                              : "bg-zinc-700 text-zinc-400"
                        }`}
                      >
                        {isActive ? "ACTIVO" : isExpired ? "VENCIDO" : "AGOTADO"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditing(coupon.code);
                            setShowForm(false);
                          }}
                          className="rounded-lg px-2 py-1 text-xs text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setDeleteTarget(coupon.code)}
                          className="rounded-lg px-2 py-1 text-xs text-zinc-500 transition-colors hover:bg-red-950/30 hover:text-red-400"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <ConfirmDialog
          open
          title="Eliminar cupón"
          message={`¿Eliminar el cupón "${deleteTarget}"? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          danger
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <p className={`text-2xl font-bold ${color}`}>
        {typeof value === "number" ? value.toLocaleString("es-AR") : value}
      </p>
      <p className="mt-1 text-xs text-zinc-500">{label}</p>
    </div>
  );
}

function CouponForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: CouponData;
  onSave: (data: {
    code: string;
    kind: "fixed" | "percent";
    value: number;
    minSubtotal?: number;
    maxUses?: number;
    expiresAt?: string | null;
  }) => void;
  onCancel: () => void;
}) {
  const [code, setCode] = useState(initial?.code ?? "");
  const [kind, setKind] = useState<"fixed" | "percent">(initial?.kind ?? "fixed");
  const [value, setValue] = useState(initial?.value?.toString() ?? "");
  const [minSubtotal, setMinSubtotal] = useState(initial?.minSubtotal?.toString() ?? "0");
  const [maxUses, setMaxUses] = useState(initial?.maxUses?.toString() ?? "1");
  const [expiresAt, setExpiresAt] = useState(
    initial?.expiresAt ? new Date(initial.expiresAt).toISOString().slice(0, 10) : "",
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      code,
      kind,
      value: Number(value),
      minSubtotal: Number(minSubtotal),
      maxUses: Number(maxUses),
      expiresAt: expiresAt || null,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4"
    >
      <h3 className="text-sm font-semibold text-zinc-200">
        {initial ? `Editar cupón: ${initial.code}` : "Nuevo cupón"}
      </h3>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className={initial ? "col-span-2 sm:col-span-1" : "col-span-2 sm:col-span-1"}>
          <label className={labelClass}>Código</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            disabled={!!initial}
            required
            className={`${inputClass} uppercase ${initial ? "opacity-50" : ""}`}
            placeholder="VERANO20"
          />
        </div>
        <div>
          <label className={labelClass}>Tipo</label>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as "fixed" | "percent")}
            className={inputClass}
          >
            <option value="fixed">Fijo ($)</option>
            <option value="percent">Porcentaje (%)</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>
            {kind === "percent" ? "Porcentaje" : "Monto"}
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
            min={0}
            max={kind === "percent" ? 100 : 999999}
            className={inputClass}
            placeholder={kind === "percent" ? "10" : "5000"}
          />
        </div>
        <div>
          <label className={labelClass}>Compra mínima</label>
          <input
            type="number"
            value={minSubtotal}
            onChange={(e) => setMinSubtotal(e.target.value)}
            min={0}
            className={inputClass}
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Usos máximos</label>
          <input
            type="number"
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
            min={1}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Expira</label>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-full bg-amber-400 px-6 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-300"
        >
          {initial ? "Guardar cambios" : "Crear cupón"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-zinc-700 px-6 py-2 text-sm text-zinc-400 transition-colors hover:text-zinc-200"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
