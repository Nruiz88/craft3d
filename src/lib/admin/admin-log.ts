import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { admin_logs } from "@/lib/db/schema";

export interface AdminLog {
  id: number;
  action: string;
  detail: string;
  createdAt: string;
}

interface AdminLogRow {
  id: number;
  action: string;
  detail: string;
  created_at: string | Date;
}

const toAdminLog = (row: AdminLogRow): AdminLog => ({
  id: row.id,
  action: row.action,
  detail: row.detail,
  createdAt:
    row.created_at instanceof Date
      ? row.created_at.toISOString()
      : String(row.created_at),
});

export async function logAdminAction(
  action: string,
  detail: string,
): Promise<void> {
  try {
    await db.insert(admin_logs).values({ action, detail });
  } catch {
    // El log no debe romper el flujo principal
  }
}

export async function getAdminLogs(limit = 100): Promise<AdminLog[]> {
  try {
    const rows = await db
      .select()
      .from(admin_logs)
      .orderBy(desc(admin_logs.created_at))
      .limit(limit);
    return rows.map((row) => toAdminLog(row as AdminLogRow));
  } catch {
    return [];
  }
}
