import "server-only";
import { supabase } from "./supabase";

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
  created_at: string;
}

const toAdminLog = (row: AdminLogRow): AdminLog => ({
  id: row.id,
  action: row.action,
  detail: row.detail,
  createdAt: row.created_at,
});

export async function logAdminAction(
  action: string,
  detail: string,
): Promise<void> {
  try {
    await supabase.from("admin_logs").insert({ action, detail });
  } catch {
    // El log no debe romper el flujo principal
  }
}

export async function getAdminLogs(limit = 100): Promise<AdminLog[]> {
  try {
    const { data, error } = await supabase
      .from("admin_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) return [];
    return (data ?? []).map((row) => toAdminLog(row as AdminLogRow));
  } catch {
    return [];
  }
}
