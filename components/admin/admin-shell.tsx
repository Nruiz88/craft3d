"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/admin/actions";

function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      className={`${className} text-amber-400`}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2 2.5 7v10L12 22l9.5-5V7L12 2Zm-1 2.4L4.5 8.2v6.9l6.5 3.4V4.4Zm2 0v14.1l6.5-3.4V8.2L13 4.4Z" />
      <path
        d="m12 11.8-6.5-3.6 1-1.8 6.5 3.6-1 1.8Z"
        fill="#fbbf24"
        opacity="0.6"
      />
    </svg>
  );
}

const icons = {
  products: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5" aria-hidden="true">
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
      <path d="m3 8 9 5 9-5" />
      <path d="M12 13v8" />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  store: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  clients: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  sales: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5" aria-hidden="true">
      <path d="M3 3v18h18" />
      <path d="m7 15 4-4 3 3 5-6" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  ),
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5" aria-hidden="true">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  drops: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5" aria-hidden="true">
      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7Z" />
      <path d="M9 15a3 3 0 0 0 3 3" />
    </svg>
  ),
  waitlist: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  restock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5" aria-hidden="true">
      <path d="M3 12a9 9 0 0 1 15.36-6.36L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.36 6.36L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  ),
};

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
  badgeKey?: keyof AdminBadges;
}

export interface AdminBadges {
  restock: number;
  waitlist: number;
  ventas: number;
}

const navSections: { label: string; items: NavItem[] }[] = [
  {
    label: "Inicio",
    items: [{ href: "/admin", label: "Dashboard", icon: icons.dashboard, exact: true }],
  },
  {
    label: "Catálogo",
    items: [
      { href: "/admin/productos", label: "Productos", icon: icons.products, exact: false },
      { href: "/admin/nuevo", label: "Nuevo producto", icon: icons.plus, exact: true },
      { href: "/admin/restock", label: "Reposición", icon: icons.restock, exact: false, badgeKey: "restock" },
    ],
  },
  {
    label: "Drops",
    items: [
      { href: "/admin/drops", label: "Ver drops", icon: icons.drops, exact: false },
      { href: "/admin/drops/nuevo", label: "Nuevo drop", icon: icons.plus, exact: true },
      { href: "/admin/waitlist", label: "Lista de espera", icon: icons.waitlist, exact: false, badgeKey: "waitlist" },
    ],
  },
  {
    label: "Gestión",
    items: [
      { href: "/admin/ventas", label: "Ventas", icon: icons.sales, exact: false, badgeKey: "ventas" },
      { href: "/admin/clientes", label: "Clientes", icon: icons.clients, exact: false },
      { href: "/admin/actividad", label: "Actividad", icon: icons.dashboard, exact: false },
      { href: "/admin/configuracion", label: "Configuración", icon: icons.settings, exact: true },
    ],
  },
];

function currentTitle(pathname: string): string {
  if (pathname === "/admin") return "Dashboard";
  if (pathname.startsWith("/admin/restock")) return "Avisos de reposición";
  if (pathname.startsWith("/admin/waitlist")) return "Lista de espera";
  if (pathname.startsWith("/admin/drops/nuevo")) return "Nuevo drop";
  if (pathname.startsWith("/admin/drops")) return "Drops";
  if (pathname.startsWith("/admin/nuevo")) return "Nuevo producto";
  if (pathname.startsWith("/admin/productos")) return "Productos";
  if (pathname.startsWith("/admin/ventas")) return "Ventas";
  if (pathname.startsWith("/admin/clientes")) return "Clientes";
  if (pathname.startsWith("/admin/actividad")) return "Actividad";
  if (pathname.startsWith("/admin/configuracion")) return "Configuración";
  return "Dashboard";
}

export default function AdminShell({
  children,
  badges,
}: {
  children: React.ReactNode;
  badges?: AdminBadges;
}) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const navLink = (item: NavItem, compact = false) => {
    const active = isActive(item.href, item.exact);
    const badge = item.badgeKey ? badges?.[item.badgeKey] ?? 0 : 0;
    const base = "inline-flex items-center gap-2.5 rounded-lg text-sm font-medium transition-colors";
    const state = active
      ? "bg-amber-400/10 text-amber-300"
      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100";
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`${base} ${state} ${
          compact ? "relative h-10 w-10 justify-center" : "px-3 py-2"
        }`}
      >
        {item.icon}
        {!compact ? (
          <>
            <span className="flex-1">{item.label}</span>
            {badge > 0 ? (
              <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold leading-none text-zinc-950">
                {badge}
              </span>
            ) : null}
          </>
        ) : badge > 0 ? (
          <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-amber-400" />
        ) : null}
      </Link>
    );
  };

  const title = currentTitle(pathname);

  return (
    <div className="min-h-screen bg-zinc-950 lg:pl-64">
      {/* Sidebar escritorio */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-zinc-800 bg-zinc-950 lg:flex">
        <Link href="/admin" className="flex items-center gap-3 px-6 py-5">
          <Logo />
          <div>
            <p className="text-lg font-bold leading-tight tracking-tight text-zinc-50">
              Craf<span className="text-amber-400">3d</span>
            </p>
            <p className="text-xs text-zinc-500">Panel de administración</p>
          </div>
        </Link>

        <nav className="mt-1 flex-1 space-y-5 overflow-y-auto px-3 pb-4">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-600">
                {section.label}
              </p>
              <div className="flex flex-col gap-1">
                {section.items.map((item) => navLink(item))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-zinc-800 px-6 py-4">
          <p className="text-xs text-zinc-600">
            Craf<span className="text-amber-400/80">3d</span> · Panel v0.1
          </p>
        </div>
      </aside>

      {/* Contenido */}
      <div className="flex min-h-screen flex-col">
        {/* Header superior */}
        <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
          <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <Link href="/admin" className="flex shrink-0 items-center gap-2 lg:hidden">
                <Logo className="h-7 w-7" />
                <span className="text-sm font-bold text-zinc-50">
                  Craf<span className="text-amber-400">3d</span>
                </span>
              </Link>
              <div className="hidden min-w-0 lg:block">
                <p className="text-xs text-zinc-500">Panel de administración</p>
                <p className="truncate text-sm font-semibold text-zinc-100">{title}</p>
              </div>
              <p className="truncate text-sm font-semibold text-zinc-100 lg:hidden">
                {title}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <Link
                href="/"
                aria-label="Ver tienda"
                title="Ver tienda"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-100"
              >
                {icons.store}
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  aria-label="Salir"
                  title="Salir"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-red-950/40 hover:text-red-400"
                >
                  {icons.logout}
                </button>
              </form>
            </div>
          </div>
        </header>

        {/* Navegación iconos mobile */}
        <nav className="flex items-center gap-1 overflow-x-auto border-b border-zinc-800 px-3 py-2 lg:hidden">
          {navSections.map((section, sectionIndex) => (
            <div key={section.label} className="flex items-center gap-1">
              {sectionIndex > 0 ? (
                <span className="mx-2 h-6 w-px shrink-0 bg-zinc-800" aria-hidden="true" />
              ) : null}
              {section.items.map((item) => navLink(item, true))}
            </div>
          ))}
        </nav>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
