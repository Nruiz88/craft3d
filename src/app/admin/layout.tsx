import AdminShell from "@/components/admin/admin-shell";
import { db } from "@/lib/db/client";
import { drop_waitlist, orders, restock_requests } from "@/lib/db/schema";
import { count, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function countTable(
  table: typeof restock_requests | typeof drop_waitlist,
): Promise<number> {
  try {
    const rows = await db.select({ value: count() }).from(table);
    return rows[0]?.value ?? 0;
  } catch {
    return 0;
  }
}

async function countPendingOrders(): Promise<number> {
  try {
    const rows = await db
      .select({ value: count() })
      .from(orders)
      .where(eq(orders.status, "pendiente"));
    return rows[0]?.value ?? 0;
  } catch {
    return 0;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [restock, waitlist, pendingOrders] = await Promise.all([
    countTable(restock_requests),
    countTable(drop_waitlist),
    countPendingOrders(),
  ]);

  return (
    <AdminShell
      badges={{ restock, waitlist, ventas: pendingOrders }}
    >
      {children}
    </AdminShell>
  );
}
