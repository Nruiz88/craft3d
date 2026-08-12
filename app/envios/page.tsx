import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { LegalSection } from "@/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Envíos y devoluciones",
  description:
    "Política de envíos y devoluciones de Craft3d: costos, tiempos, tracking y cambios de productos impresos en 3D.",
};

export default function EnviosPage() {
  return (
    <LegalPage
      eyebrow="LOGÍSTICA"
      title="Envíos y devoluciones"
      updated="12 de agosto de 2026"
    >
      <LegalSection title="1. Cobertura">
        <p>
          Enviamos a todo el país, desde Neuquén, mediante correo u otras
          empresas de logística. En la ciudad de Neuquén también podés retirar
          o acordar entrega sin cargo.
        </p>
      </LegalSection>

      <LegalSection title="2. Producción">
        <p>
          Cada pieza se imprime y termina a mano. El tiempo de producción
          estimado es de 3 a 7 días hábiles desde la acreditación del pago. Los
          drops pueden tener plazos propios que se informan en la página del
          producto.
        </p>
        <p>
          Una vez despachado, te enviamos el número de seguimiento y avisamos
          por email y/o WhatsApp.
        </p>
      </LegalSection>

      <LegalSection title="3. Costos y envío gratis">
        <p>
          El costo de envío se coordina según tu localidad y el tamaño del
          pedido. Los pedidos que superen los $80.000 tienen envío gratis al
          interior del país.
        </p>
      </LegalSection>

      <LegalSection title="4. Plazos de entrega estimados">
        <p>
          Estimativamente: Neuquén capital 1 a 2 días hábiles, resto del país 3
          a 10 días hábiles según el correo y la zona. Los plazos pueden variar
          por factores externos al correo (paros, clima, etc.), sobre los que
          Craft3d no tiene control.
        </p>
      </LegalSection>

      <LegalSection title="5. Recepción y control">
        <p>
          Revisá el paquete al recibirlo. Si llega dañado o con faltantes,
          registrá una foto y avisanos dentro de las <strong>48 horas</strong>{" "}
          de la recepción. Con el reclamo verificado reponemos la pieza o el
          faltante sin costo.
        </p>
      </LegalSection>

      <LegalSection title="6. Cambios y devoluciones">
        <p>
          Al ser productos impresos a pedido, no se aceptan cambios por gusto,
          color o talla salvo acuerdo previo. Podés devolver un producto en los
          siguientes casos:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Defectos de fabricación o daños en el transporte.</li>
          <li>Diferencia de producto respecto de lo pedido.</li>
          <li>Cancelación del pedido antes de iniciar la producción.</li>
        </ul>
        <p>
          Las reservas de drops son compromisos de compra: la seña solo se
          devuelve si el drop no se concreta por causas de Craft3d.
        </p>
      </LegalSection>

      <LegalSection title="7. Contacto">
        <p>
          Para reclamos o consultas de envío: {site.email} o por{" "}
          <Link href={site.whatsapp} className="text-cyan-300 hover:text-cyan-200">
            WhatsApp
          </Link>
          . Tené a mano el número de pedido.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
