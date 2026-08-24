"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const segmentLabels: Record<string, string> = {
  admin: "Admin",
  productos: "Productos",
  nuevo: "Nuevo",
  editar: "Editar",
  ventas: "Ventas",
  clientes: "Clientes",
  actividad: "Actividad",
  configuracion: "Configuración",
  drops: "Drops",
  mysterybox: "Cajas sorpresa",
  revelaciones: "Revelaciones",
  restock: "Reposición",
  waitlist: "Lista de espera",
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments.map((segment, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label = segmentLabels[segment] || (segment.match(/^\d+$/) ? `#${segment}` : segment);
    const isLast = i === segments.length - 1;
    return { href, label, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1.5 text-xs text-zinc-500">
        {crumbs.map((crumb) => (
          <li key={crumb.href} className="flex items-center gap-1.5">
            <span className="text-zinc-700">/</span>
            {crumb.isLast ? (
              <span className="font-medium text-zinc-300">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="transition-colors hover:text-amber-300"
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
