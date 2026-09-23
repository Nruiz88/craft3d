"use server";

import { randomUUID } from "node:crypto";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { notifications } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/user";

export interface Notification {
  id: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export async function getNotifications(): Promise<Notification[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  try {
    const rows = await db
      .select()
      .from(notifications)
      .where(eq(notifications.user_id, user.id))
      .orderBy(desc(notifications.created_at))
      .limit(30);
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      message: row.message,
      link: row.link ?? undefined,
      read: Boolean(row.read),
      createdAt: (row.created_at instanceof Date ? row.created_at : new Date(row.created_at)).toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function getUnreadCount(): Promise<number> {
  const user = await getCurrentUser();
  if (!user) return 0;
  try {
    const rows = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(notifications)
      .where(and(eq(notifications.user_id, user.id), eq(notifications.read, false)));
    return Number(rows[0]?.count ?? 0);
  } catch {
    return 0;
  }
}

export async function markAsRead(id: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.id, id), eq(notifications.user_id, user.id)))
    .execute();
}

export async function markAllAsRead(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  await db.update(notifications).set({ read: true }).where(eq(notifications.user_id, user.id)).execute();
}

/** Crea una notificación in-app (uso interno del sistema). */
export async function pushNotification(
  userId: string,
  title: string,
  message: string,
  link?: string,
): Promise<void> {
  await db
    .insert(notifications)
    .values({ id: randomUUID(), user_id: userId, title, message, link: link ?? null })
    .execute();
}
