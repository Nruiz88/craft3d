import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { LegalSection } from "@/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description:
    "Política de privacidad y cookies de Craft3d: qué datos recopilamos, cómo los usamos y cuáles son tus derechos.",
};

export default function PrivacidadPage() {
  return (
    <LegalPage
      eyebrow="PRIVACIDAD"
      title="Política de privacidad"
      updated="12 de agosto de 2026"
    >
      <LegalSection title="1. Qué datos recopilamos">
        <p>Al usar la tienda podemos recolectar:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Datos de cuenta</strong>: nombre, email y contraseña
            (encriptada) cuando te registrás.
          </li>
          <li>
            <strong>Datos de envío</strong>: teléfono, dirección, ciudad,
            provincia y código postal que cargás en tu perfil o al comprar.
          </li>
          <li>
            <strong>Datos de pedido</strong>: productos comprados, montos,
            método de pago y estado del pedido.
          </li>
          <li>
            <strong>Favoritos y avisos</strong>: productos que guardás y emails
            con los que pedís avisos de reposición o lista de espera.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Para qué usamos tus datos">
        <ul className="list-disc space-y-1 pl-5">
          <li>Procesar y gestionar tus pedidos y reservas.</li>
          <li>Enviarte confirmaciones de pedido, pago y avisos de reposición.</li>
          <li>Brindarte el perfil de jugador (monedas, insignias y canjes).</li>
          <li>Responder consultas y brindar soporte.</li>
        </ul>
        <p>
          No vendemos ni alquilamos tus datos personales a terceros.
        </p>
      </LegalSection>

      <LegalSection title="3. Compartir datos con terceros">
        <p>
          Para que la tienda funcione, tus datos se comparten con proveedores
          estrictamente necesarios:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Supabase</strong>: base de datos, autenticación y hosting.
          </li>
          <li>
            <strong>Mercado Pago</strong>: procesa el pago. Solo se comparte lo
            necesario para cobrar; los datos de tarjeta nunca pasan por nuestra
            web.
          </li>
          <li>
            <strong>Resend</strong>: servicio de envío de emails (confirmaciones
            y avisos).
          </li>
          <li>
            <strong>Vercel</strong>: hosting del sitio.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Cookies y almacenamiento local">
        <p>
          Usamos cookies de sesión para mantener tu sesión iniciada y datos de
          navegador (carrito y favoritos) que se guardan localmente en tu
          dispositivo. Estos datos no se comparten con fines publicitarios.
        </p>
      </LegalSection>

      <LegalSection title="5. Seguridad">
        <p>
          Tus datos se transmiten con cifrado (HTTPS) y la contraseña se guarda
          con hash. El acceso a la información se limita a lo necesario para
          operar la tienda.
        </p>
      </LegalSection>

      <LegalSection title="6. Tus derechos">
        <p>
          De acuerdo con la Ley 25.326 de Protección de Datos Personales de la
          República Argentina, podés solicitar acceso, rectificación o
          eliminación de tus datos escribiéndonos a {site.email}. También podés
          cerrar tu sesión o eliminar tu cuenta en cualquier momento.
        </p>
      </LegalSection>

      <LegalSection title="7. Contacto">
        <p>
          Ante cualquier consulta sobre privacidad: {site.email} o por{" "}
          <Link href={site.whatsapp} className="text-cyan-300 hover:text-cyan-200">
            WhatsApp
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
