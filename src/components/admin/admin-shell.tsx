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

import type { NavItem, AdminBadges } from "./admin-icons";
import { icons } from "./admin-icons";
import { navSections } from "./admin-nav";
import Breadcrumbs from "./breadcrumbs";
import SearchModal from "./search-modal";

function currentTitle(pathname: string): string {
  if (pathname === "/admin") return "Dashboard";
  if (pathname.startsWith("/admin/restock")) return "Avisos de reposición";
  if (pathname.startsWith("/admin/waitlist")) return "Lista de espera";
  if (pathname.startsWith("/admin/drops/nuevo")) return "Nuevo drop";
  if (pathname.startsWith("/admin/drops")) return "Drops";
  if (pathname.startsWith("/admin/mysterybox/revelaciones")) return "Revelaciones";
  if (pathname.startsWith("/admin/mysterybox/nuevo")) return "Nueva caja sorpresa";
  if (pathname.startsWith("/admin/mysterybox")) return "Cajas sorpresa";
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
              <SearchModal />
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
        <nav className="flex flex-wrap gap-1 border-b border-zinc-800 px-2 py-2 lg:hidden">
          {navSections.map((section, sectionIndex) => (
            <div key={section.label} className="flex items-center gap-1">
              {sectionIndex > 0 ? (
                <span className="mx-1 h-8 w-px shrink-0 bg-zinc-800" aria-hidden="true" />
              ) : null}
              {section.items.map((item) => {
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors ${
                      active ? "bg-amber-400/10 text-amber-300" : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
                    }`}
                  >
                    {item.icon}
                    <span className="truncate max-w-[60px]">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <main className="flex-1"><div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8"><Breadcrumbs /></div>{children}</main>
      </div>
    </div>
  );
}
