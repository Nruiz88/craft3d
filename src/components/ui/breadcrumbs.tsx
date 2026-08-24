import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

/**
 * Breadcrumbs para páginas públicas.
 * Genera HTML semántico + JSON-LD para rich snippets en Google.
 */
export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://craft3d.vercel.app";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${baseUrl}${item.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Migajas" className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-zinc-500">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true">/</span>}
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-amber-300">
                {item.label}
              </Link>
            ) : (
              <span className="line-clamp-1 text-zinc-300">{item.label}</span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
