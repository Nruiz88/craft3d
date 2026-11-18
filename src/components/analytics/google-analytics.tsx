/**
 * Google Analytics 4 + Google Ads (gtag.js). Se activa solo si hay un ID
 * configurado. Los IDs son públicos (no secretos); se toman de
 * NEXT_PUBLIC_GA_ID y NEXT_PUBLIC_GOOGLE_ADS_ID.
 *
 * gtag.js es una sola librería: se carga una vez y se registran tantos
 * `gtag('config', ...)` como propiedades haga falta (GA4 + Google Ads). Por eso
 * no volvemos a incluir el <script src> del snippet de Ads: alcanza con sumar su
 * config al mismo bloque.
 *
 * Se renderiza como <script> nativo para que la etiqueta quede impresa en el
 * HTML inicial del servidor (React la hoista al <head>). Con next/script en
 * "afterInteractive" el tag se inyecta recién tras la hidratación y
 * verificadores como Tag Assistant / Merchant Center (que leen el HTML sin
 * ejecutar JS) pueden no detectarla.
 */
export default function GoogleAnalytics({
  gaId,
  adsId,
}: {
  gaId: string;
  adsId?: string;
}) {
  const configs = [`gtag('config', '${gaId}');`];
  if (adsId) {
    configs.push(`gtag('config', '${adsId}');`);
  }

  // Consent Mode v2: por defecto todo DENEGADO. Si el visitante ya aceptó antes
  // (localStorage "craft3d-cookie-consent" = "1"), se restaura el consentimiento
  // antes de cargar la config. El banner (cookie-banner.tsx) lo actualiza al
  // aceptar/rechazar. Sin consentimiento GA4 envía pings sin cookies.
  const consentDefault = `gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500
});
try {
  if (localStorage.getItem('craft3d-cookie-consent') === '1') {
    gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted'
    });
  }
} catch (e) {}`;

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
${consentDefault}
${configs.join("\n")}`,
        }}
      />
    </>
  );
}
