import { site } from "@/lib/utils/site";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://craft3d.com.ar";

const ogImage = `${baseUrl}/opengraph-image`;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      name: "Craft3d",
      url: baseUrl,
      logo: ogImage,
      image: ogImage,
      description: site.description,
      email: site.email,
      areaServed: "AR",
      sameAs: [
        site.instagram,
        "https://www.tiktok.com/@craft3darg",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      url: baseUrl,
      name: "Craft3d",
      inLanguage: "es-AR",
      publisher: { "@id": `${baseUrl}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${baseUrl}/catalogo?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function OrganizationSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}
