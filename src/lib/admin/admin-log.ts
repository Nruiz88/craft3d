import "server-only";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { admin_logs } from "@/lib/db/schema";

export interface AdminLog {
  id: number;
  action: string;
  detail: string;
  createdAt: string;
}

export async function logAdminAction(action: string, detail = ""): Promise<void> {
  try {
    await db.insert(admin_logs).values({ action, detail }).execute();
  } catch {
    // El log nunca debe romper la acción principal
  }
}

export async function getAdminLogs(limit = 200): Promise<AdminLog[]> {
  const rows = await db
    .select()
    .from(admin_logs)
    .orderBy(desc(admin_logs.created_at), desc(admin_logs.id))
    .limit(limit);
  return rows.map((row) => ({
    id: Number(row.id),
    action: row.action,
    detail: row.detail,
    createdAt: (row.created_at instanceof Date ? row.created_at : new Date(row.created_at)).toISOString(),
  }));
}
