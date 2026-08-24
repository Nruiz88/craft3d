"use server";

/**
 * Server actions para notificaciones in-app del usuario.
 * Leer, marcar como leída, contar no leídas.
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabase } from "@/lib/supabase/client";

export interface Notification {
  id: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

interface NotificationRow {
  id: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

function rowToNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    link: row.link,
    read: row.read,
    createdAt: row.created_at,
  };
}

/** Obtener notificaciones del usuario (últimas 20) */
export async function getNotifications(): Promise<Notification[]> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return [];
  return (data as NotificationRow[]).map(rowToNotification);
}

/** Contar notificaciones no leídas */
export async function getUnreadCount(): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("read", false);

  return count ?? 0;
}

/** Marcar una notificación como leída */
export async function markAsRead(id: string): Promise<{ ok: boolean }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id)
    .eq("user_id", user.id);

  return { ok: !error };
}

/** Marcar todas como leídas */
export async function markAllAsRead(): Promise<{ ok: boolean }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);

  return { ok: !error };
}
