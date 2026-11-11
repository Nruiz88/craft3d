/**
 * Píxel de Meta (Facebook/Instagram Ads). Se activa solo si hay un ID
 * configurado en NEXT_PUBLIC_FB_PIXEL_ID. El ID del píxel es público
 * (no es secreto), igual que el de Google Analytics.
 *
 * Se renderiza como <script> nativo para que la etiqueta quede impresa en el
 * HTML inicial (igual que GoogleAnalytics), así el Meta Pixel Helper y el
 * verificador de eventos la detectan sin ejecutar JS.
 *
 * Dispara PageView en la carga inicial. El resto de los eventos del embudo
 * (ViewContent, AddToCart, Purchase) se disparan desde el cliente con
 * trackMeta() en los puntos correspondientes.
 */
export default function MetaPixel({ pixelId }: { pixelId: string }) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${pixelId}');
fbq('track','PageView');`,
        }}
      />
      <noscript
        dangerouslySetInnerHTML={{
          __html: `<img height="1" width="1" style="display:none" alt="" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>`,
        }}
      />
    </>
  );
}
