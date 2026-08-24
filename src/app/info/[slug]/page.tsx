import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEditablePage } from "@/app/admin/actions/pages";
import Breadcrumbs from "@/components/ui/breadcrumbs";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getEditablePage(slug);
  if (!page) return {};
  return {
    title: page.title,
    description: page.subtitle,
  };
}

export default async function EditablePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getEditablePage(slug);
  if (!page || !page.published) notFound();

  return (
    <div className="bg-zinc-950 pb-20">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Breadcrumbs
          items={[
            { label: "Inicio", href: "/" },
            { label: page.title },
          ]}
        />
        <h1 className="pixel mt-4 text-3xl font-bold text-zinc-100 sm:text-4xl">
          {page.title}
        </h1>
        {page.subtitle && (
          <p className="mt-2 text-sm text-zinc-500">{page.subtitle}</p>
        )}
        <div className="mt-10 space-y-8">
          {page.content.map((section, i) => (
            <section key={i}>
              {section.heading && (
                <h2 className="mb-4 text-lg font-semibold text-zinc-200">
                  {section.heading}
                </h2>
              )}
              <div
                className="prose prose-invert prose-zinc max-w-none text-sm leading-relaxed text-zinc-400"
                dangerouslySetInnerHTML={{ __html: section.body }}
              />
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
