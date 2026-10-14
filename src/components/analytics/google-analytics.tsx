/**
 * Google Analytics 4 (gtag.js). Se activa solo si hay un ID configurado.
 * El ID es público (no secreto); se toma de NEXT_PUBLIC_GA_ID.
 *
 * Se renderiza como <script> nativo para que la etiqueta quede impresa en el
 * HTML inicial del servidor (React la hoista al <head>). Con next/script en
 * "afterInteractive" el tag se inyecta recién tras la hidratación y
 * verificadores como Tag Assistant / Merchant Center (que leen el HTML sin
 * ejecutar JS) pueden no detectarla.
 */
export default function GoogleAnalytics({ gaId }: { gaId: string }) {
  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`,
        }}
      />
    </>
  );
}
