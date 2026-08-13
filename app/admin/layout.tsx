import AdminShell from "@/components/admin/admin-shell";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function countRows(
  table: string,
  column?: string,
  value?: string,
): Promise<number> {
  try {
    let query = supabase.from(table).select("*", { count: "exact", head: true });
    if (column && value) query = query.eq(column, value);
    const { count } = await query;
    return count ?? 0;
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
    countRows("restock_requests"),
    countRows("drop_waitlist"),
    countRows("orders", "status", "pendiente"),
  ]);

  return (
    <AdminShell
      badges={{ restock, waitlist, ventas: pendingOrders }}
    >
      {children}
    </AdminShell>
  );
}
