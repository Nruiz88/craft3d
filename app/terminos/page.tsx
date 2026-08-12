import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { LegalSection } from "@/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description:
    "Términos y condiciones de compra de Craft3d, tienda de impresión 3D y arte en filamento.",
};

export default function TerminosPage() {
  return (
    <LegalPage
      eyebrow="CONTRATO"
      title="Términos y condiciones"
      updated="12 de agosto de 2026"
    >
      <LegalSection title="1. Información general">
        <p>
          Estos términos regulan la compra de productos de Craft3d
          ({site.email}), tienda online de artículos impresos en 3D (cuadros
          Hueforge, figuras, dummys, mates y decoración). Craft3d opera desde
          Neuquén, Argentina, y vende dentro del territorio nacional.
        </p>
        <p>
          Al hacer un pedido aceptás estos términos. Si no estás de acuerdo,
          no realices compras en la tienda.
        </p>
      </LegalSection>

      <LegalSection title="2. Productos y producción a pedido">
        <p>
          Todos los productos se imprimen y terminan a mano, por lo que pueden
          presentar pequeñas variaciones respecto de las fotos (texturas de
          capa, brillo, colores). Las imágenes son de referencia.
        </p>
        <p>
          El tiempo estimado de producción es de 3 a 7 días hábiles desde la
          confirmación del pago, salvo que se indique otra cosa en el producto
          (como en los drops).
        </p>
      </LegalSection>

      <LegalSection title="3. Precios y pagos">
        <p>
          Los precios se muestran en pesos argentinos (ARS) e incluyen IVA.
          Craft3d se reserva el derecho de modificar precios, pero los cambios
          no afectan pedidos ya confirmados.
        </p>
        <p>
          Los medios de pago disponibles son Mercado Pago y transferencia
          bancaria. Un pedido no se considera confirmado hasta que el pago se
          acredita (o se abona la seña en el caso de reservas).
        </p>
      </LegalSection>

      <LegalSection title="4. Drops y reservas con seña">
        <p>
          Los drops son lanzamientos por tiempo limitado con unidades
          numeradas. Podés reservar abonando una seña (porcentaje o monto
          fijo). La seña asegura tu unidad; el saldo se coordina por{" "}
          <Link href={site.whatsapp} className="text-cyan-300 hover:text-cyan-200">
            WhatsApp
          </Link>
          .
        </p>
        <p>
          Si el drop no se concreta por causas de Craft3d, se devuelve el 100%
          de la seña.
        </p>
      </LegalSection>

      <LegalSection title="5. Envíos">
        <p>
          Hacemos envíos a todo el país. El costo y el medio se coordinan según
          tu localidad, y el envío es gratis en pedidos que superen los $
          80.000. Más detalle en la{" "}
          <Link href="/envios" className="text-cyan-300 hover:text-cyan-200">
            política de envíos y devoluciones
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="6. Cambios y devoluciones">
        <p>
          Al ser productos hechos a pedido, no se realizan cambios por gusto o
          color salvo acuerdos previos. Si el producto llega dañado o con
          defectos, tenés 48 horas desde la recepción para reclamarlo y
          lo reponemos sin costo. Más detalle en la{" "}
          <Link href="/envios" className="text-cyan-300 hover:text-cyan-200">
            política de envíos y devoluciones
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="7. Propiedad intelectual">
        <p>
          Las piezas y diseños pueden incluir personajes o marcas de terceros.
          Craft3d no reclama la titularidad de esas marcas, que pertenecen a
          sus respectivos dueños, y solo realiza piezas bajo demanda para uso
          personal.
        </p>
      </LegalSection>

      <LegalSection title="8. Contacto">
        <p>
          Ante cualquier duda, escribinos a {site.email} o por{" "}
          <Link href={site.whatsapp} className="text-cyan-300 hover:text-cyan-200">
            WhatsApp
          </Link>
          . Respondemos en horario hábil.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
