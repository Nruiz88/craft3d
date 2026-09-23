import type { ReactNode } from "react";
import { count, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { orders, restock_requests, drop_waitlist } from "@/lib/db/schema";
import { getCsrfToken } from "@/lib/utils/csrf";
import { CsrfProvider } from "@/components/admin/csrf-provider";
import AdminShell from "@/components/admin/admin-shell";

export const metadata = { title: "Admin" };

/** Badges del menú: pendientes reales de cada sección. */
async function getAdminBadges() {
  try {
    const [pedidosPendientes] = await db
      .select({ value: count() })
      .from(orders)
      .where(eq(orders.status, "pendiente"));
    const [reposiciones] = await db
      .select({ value: count() })
      .from(restock_requests);
    const [listaEspera] = await db
      .select({ value: count() })
      .from(drop_waitlist);

    return {
      ventas: Number(pedidosPendientes?.value ?? 0),
      restock: Number(reposiciones?.value ?? 0),
      waitlist: Number(listaEspera?.value ?? 0),
    };
  } catch {
    // DB no disponible: el panel debe seguir cargando, sin badges.
    return { ventas: 0, restock: 0, waitlist: 0 };
  }
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const [badges, csrfToken] = await Promise.all([
    getAdminBadges(),
    getCsrfToken(),
  ]);

  return (
    <AdminShell badges={badges}>
      <CsrfProvider token={csrfToken}>
        <div className="admin-layout">{children}</div>
      </CsrfProvider>
    </AdminShell>
  );
}
