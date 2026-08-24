"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  type Notification,
} from "@/app/cuenta/actions/notifications";

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Poll unread count every 30s
  useEffect(() => {
    async function check() {
      const c = await getUnreadCount();
      setCount(c);
    }
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function toggle() {
    if (!loaded) {
      const data = await getNotifications();
      setNotifications(data);
      setLoaded(true);
    }
    setOpen(!open);
  }

  async function handleMarkRead(id: string) {
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setCount((c) => Math.max(0, c - 1));
  }

  async function handleMarkAllRead() {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setCount(0);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={toggle}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
        aria-label={`Notificaciones${count > 0 ? ` (${count} sin leer)` : ""}`}
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[9px] font-bold text-zinc-950">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
            <h3 className="text-sm font-semibold text-zinc-200">Notificaciones</h3>
            {count > 0 && (
              <button onClick={handleMarkAllRead} className="text-[10px] text-amber-300 hover:text-amber-200">
                Marcar todo leído
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-3xl" aria-hidden="true">🔔</p>
                <p className="mt-2 text-xs text-zinc-500">Sin notificaciones</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`border-b border-zinc-800/50 px-4 py-3 transition-colors hover:bg-zinc-800/30 ${!n.read ? "bg-amber-400/5" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    {!n.read && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                    )}
                    <div className="min-w-0 flex-1">
                      {n.link ? (
                        <Link href={n.link} onClick={() => { handleMarkRead(n.id); setOpen(false); }} className="text-sm font-medium text-zinc-200 hover:text-amber-300">
                          {n.title}
                        </Link>
                      ) : (
                        <p className="text-sm font-medium text-zinc-200">{n.title}</p>
                      )}
                      <p className="mt-0.5 text-xs text-zinc-500 line-clamp-2">{n.message}</p>
                      <p className="mt-1 text-[10px] text-zinc-600">
                        {new Date(n.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    {!n.read && (
                      <button onClick={() => handleMarkRead(n.id)} className="shrink-0 text-[10px] text-zinc-600 hover:text-zinc-400" title="Marcar como leída">
                        ✓
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <Link href="/cuenta" onClick={() => setOpen(false)} className="block border-t border-zinc-800 px-4 py-2.5 text-center text-xs text-zinc-500 transition-colors hover:text-zinc-300">
            Ver mi cuenta →
          </Link>
        </div>
      )}
    </div>
  );
}
