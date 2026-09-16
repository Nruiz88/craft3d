"use server";

/**
 * Server actions para notificaciones in-app del usuario.
 * Leer, marcar como leída, contar no leídas.
 */

import { getServerSession } from "next-auth";
import { and, desc, eq, sql } from "drizzle-orm";
import { authOptions } from "@/auth";
import { db } from "@/lib/db/client";
import { notifications } from "@/lib/db/schema";

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
  created_at: string | Date;
}

function rowToNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    link: row.link,
    read: row.read,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
  };
}

async function currentUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

/** Obtener notificaciones del usuario (últimas 20) */
export async function getNotifications(): Promise<Notification[]> {
  const userId = await currentUserId();
  if (!userId) return [];

  try {
    const rows = await db
      .select()
      .from(notifications)
      .where(eq(notifications.user_id, userId))
      .orderBy(desc(notifications.created_at))
      .limit(20);
    return (rows as NotificationRow[]).map(rowToNotification);
  } catch {
    return [];
  }
}

/** Contar notificaciones no leídas */
export async function getUnreadCount(): Promise<number> {
  const userId = await currentUserId();
  if (!userId) return 0;

  try {
    const res = await db.execute(
      sql`select count(*)::int as count from notifications where user_id = ${userId} and read = false`,
    );
    return Number((res.rows[0] as { count?: unknown } | undefined)?.count ?? 0);
  } catch {
    return 0;
  }
}

/** Marcar una notificación como leída */
export async function markAsRead(id: string): Promise<{ ok: boolean }> {
  const userId = await currentUserId();
  if (!userId) return { ok: false };

  try {
    await db
      .update(notifications)
      .set({ read: true })
      .where(
        and(eq(notifications.id, id), eq(notifications.user_id, userId)),
      );
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

/** Marcar todas como leídas */
export async function markAllAsRead(): Promise<{ ok: boolean }> {
  const userId = await currentUserId();
  if (!userId) return { ok: false };

  try {
    await db
      .update(notifications)
      .set({ read: true })
      .where(
        and(
          eq(notifications.user_id, userId),
          eq(notifications.read, false),
        ),
      );
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
