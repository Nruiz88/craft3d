import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { LegalSection, LegalHighlight } from "@/components/layout/legal-page";
import { site } from "@/lib/utils/site";

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
      toc={["Qué datos recopilamos", "Para qué usamos tus datos", "Compartir datos con terceros", "Cookies y almacenamiento", "Seguridad", "Tus derechos", "Contacto"]}
      breadcrumbLabel="Política de privacidad"
      icon={
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        </svg>
      }
    >
      <LegalSection number={1} title="Qué datos recopilamos">
        <p>Al usar la tienda podemos recolectar:</p>
        <ul className="space-y-2">
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-cyan-400" aria-hidden="true">▸</span>
            <span>
              <strong className="text-zinc-200">Datos de cuenta</strong>: nombre, email y contraseña
              (encriptada) cuando te registrás.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-cyan-400" aria-hidden="true">▸</span>
            <span>
              <strong className="text-zinc-200">Datos de envío</strong>: teléfono, dirección, ciudad,
              provincia y código postal que cargás en tu perfil o al comprar.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-cyan-400" aria-hidden="true">▸</span>
            <span>
              <strong className="text-zinc-200">Datos de pedido</strong>: productos comprados, montos,
              método de pago y estado del pedido.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-cyan-400" aria-hidden="true">▸</span>
            <span>
              <strong className="text-zinc-200">Favoritos y avisos</strong>: productos que guardás y emails
              con los que pedís avisos de reposición o lista de espera.
            </span>
          </li>
        </ul>
      </LegalSection>

      <LegalSection number={2} title="Para qué usamos tus datos">
        <ul className="space-y-2">
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-cyan-400" aria-hidden="true">▸</span>
            Procesar y gestionar tus pedidos y reservas.
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-cyan-400" aria-hidden="true">▸</span>
            Enviarte confirmaciones de pedido, pago y avisos de reposición.
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-cyan-400" aria-hidden="true">▸</span>
            Brindarte el perfil de jugador (monedas, insignias y canjes).
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-cyan-400" aria-hidden="true">▸</span>
            Responder consultas y brindar soporte.
          </li>
        </ul>
        <LegalHighlight>
          No vendemos ni alquilamos tus datos personales a terceros.
        </LegalHighlight>
      </LegalSection>

      <LegalSection number={3} title="Compartir datos con terceros">
        <p>
          Para que la tienda funcione, tus datos se comparten con proveedores
          estrictamente necesarios:
        </p>
        <ul className="space-y-2">
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-cyan-400" aria-hidden="true">▸</span>
            <span>
              <strong className="text-zinc-200">Supabase</strong>: base de datos, autenticación y hosting.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-cyan-400" aria-hidden="true">▸</span>
            <span>
              <strong className="text-zinc-200">Mercado Pago</strong>: procesa el pago. Solo se comparte lo
              necesario para cobrar; los datos de tarjeta nunca pasan por nuestra web.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-cyan-400" aria-hidden="true">▸</span>
            <span>
              <strong className="text-zinc-200">Resend</strong>: servicio de envío de emails (confirmaciones
              y avisos).
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-cyan-400" aria-hidden="true">▸</span>
            <span>
              <strong className="text-zinc-200">Vercel</strong>: hosting del sitio.
            </span>
          </li>
        </ul>
      </LegalSection>

      <LegalSection number={4} title="Cookies y almacenamiento local">
        <p>
          Usamos cookies de sesión para mantener tu sesión iniciada y datos de
          navegador (carrito y favoritos) que se guardan localmente en tu
          dispositivo. Estos datos no se comparten con fines publicitarios.
        </p>
      </LegalSection>

      <LegalSection number={5} title="Seguridad">
        <p>
          Tus datos se transmiten con cifrado (HTTPS) y la contraseña se guarda
          con hash. El acceso a la información se limita a lo necesario para
          operar la tienda.
        </p>
      </LegalSection>

      <LegalSection number={6} title="Tus derechos">
        <p>
          De acuerdo con la Ley 25.326 de Protección de Datos Personales de la
          República Argentina, podés solicitar acceso, rectificación o
          eliminación de tus datos escribiéndonos a {site.email}. También podés
          cerrar tu sesión o eliminar tu cuenta en cualquier momento.
        </p>
      </LegalSection>

      <LegalSection number={7} title="Contacto">
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
