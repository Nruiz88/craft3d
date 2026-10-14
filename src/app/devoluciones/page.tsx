import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, {
  LegalSection,
  LegalHighlight,
} from "@/components/layout/legal-page";
import { site } from "@/lib/utils/site";

export const metadata: Metadata = {
  title: "Política de devoluciones y reembolsos",
  description:
    "Política de devoluciones y reembolsos de Craft3d: plazo de 14 días, cómo iniciar una devolución, quién paga el envío, métodos y plazos de reembolso.",
  alternates: { canonical: "/devoluciones" },
};

export default function DevolucionesPage() {
  return (
    <LegalPage
      eyebrow="CAMBIOS Y REEMBOLSOS"
      title="Política de devoluciones y reembolsos"
      updated="14 de octubre de 2026"
      breadcrumbLabel="Devoluciones y reembolsos"
      toc={[
        "Plazo para devolver",
        "Condiciones del producto",
        "Cómo iniciar una devolución",
        "Quién paga el envío",
        "Reembolsos: método y plazo",
        "Productos dañados o incorrectos",
        "Productos a pedido y personalizados",
        "Drops y reservas",
        "Contacto",
      ]}
      icon={
        <svg
          className="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      }
    >
      <LegalSection number={1} title="Plazo para devolver">
        <p>
          Podés solicitar la devolución de tu compra dentro de los{" "}
          <strong className="text-zinc-200">14 días corridos</strong> contados
          desde la recepción del producto. Pasado ese plazo, no aceptamos
          devoluciones por arrepentimiento, aunque sí seguimos cubriendo los
          defectos de fabricación (ver sección 6).
        </p>
        <LegalHighlight>
          Este plazo es una política comercial de Craft3d y es más amplio que
          el mínimo legal de 10 días corridos que otorga la Ley 24.240 de
          Defensa del Consumidor de la República Argentina en compras a
          distancia.
        </LegalHighlight>
      </LegalSection>

      <LegalSection number={2} title="Condiciones del producto">
        <p>Para que la devolución por arrepentimiento sea válida, el producto debe:</p>
        <ul className="space-y-2">
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-cyan-400" aria-hidden="true">▸</span>
            Estar sin usar y en el mismo estado en que lo recibiste.
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-cyan-400" aria-hidden="true">▸</span>
            Conservar el empaque original y todos sus accesorios.
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-cyan-400" aria-hidden="true">▸</span>
            No presentar daños causados por el uso, golpes o limpieza
            inadecuada.
          </li>
        </ul>
        <p>
          Si el producto no cumple estas condiciones, podemos rechazar la
          devolución o aplicar un reintegro parcial.
        </p>
      </LegalSection>

      <LegalSection number={3} title="Cómo iniciar una devolución">
        <p>
          Escribinos a {site.email} o por{" "}
          <Link href={site.whatsapp} className="text-cyan-300 hover:text-cyan-200">
            WhatsApp
          </Link>{" "}
          con estos datos:
        </p>
        <ul className="space-y-2">
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-cyan-400" aria-hidden="true">▸</span>
            Número de pedido.
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-cyan-400" aria-hidden="true">▸</span>
            Producto que querés devolver y motivo.
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-cyan-400" aria-hidden="true">▸</span>
            Fotos del producto y del empaque (para agilizar la evaluación).
          </li>
        </ul>
        <p>
          Te respondemos en horario hábil con las instrucciones y la dirección
          de devolución. No envíes el producto por tu cuenta antes de recibir
          nuestra confirmación.
        </p>
      </LegalSection>

      <LegalSection number={4} title="Quién paga el envío">
        <p>
          El costo del envío de la devolución corre por cuenta del cliente,
          salvo en los siguientes casos, donde lo cubre Craft3d:
        </p>
        <ul className="space-y-2">
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-cyan-400" aria-hidden="true">▸</span>
            El producto llegó dañado o defectuoso.
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-cyan-400" aria-hidden="true">▸</span>
            Recibiste un producto distinto al que pediste.
          </li>
        </ul>
      </LegalSection>

      <LegalSection number={5} title="Reembolsos: método y plazo">
        <p>
          Una vez recibida y verificada la devolución, reintegramos el importe
          del producto por el mismo medio de pago que usaste. Los tiempos
          estimados son:
        </p>
        <ul className="space-y-2">
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-cyan-400" aria-hidden="true">▸</span>
            <span>
              <strong className="text-zinc-200">Mercado Pago</strong>: acreditamos
              el reembolso dentro de los 3 días hábiles posteriores a la
              verificación. La acreditación final depende de los plazos de
              Mercado Pago y del medio (tarjeta, dinero en cuenta, etc.).
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-cyan-400" aria-hidden="true">▸</span>
            <span>
              <strong className="text-zinc-200">Transferencia bancaria</strong>:
              transferimos a la cuenta que nos indiques dentro de los 5 días
              hábiles posteriores a la verificación.
            </span>
          </li>
        </ul>
        <LegalHighlight>
          El reembolso no incluye el costo del envío original, salvo cuando la
          devolución se debe a un error o defecto atribuible a Craft3d.
        </LegalHighlight>
      </LegalSection>

      <LegalSection number={6} title="Productos dañados o incorrectos">
        <p>
          Revisá el paquete al recibirlo. Si el producto llega dañado, con
          faltantes o no coincide con lo pedido, escribinos dentro de las{" "}
          <strong className="text-zinc-200">48 horas</strong> de la recepción
          con fotos del producto y del embalaje. En estos casos reponemos la
          pieza sin costo o, si preferís, reembolsamos el importe completo,
          incluido el envío.
        </p>
      </LegalSection>

      <LegalSection number={7} title="Productos a pedido y personalizados">
        <p>
          Muchos de nuestros artículos se imprimen y terminan a mano
          especialmente para tu pedido. Los productos personalizados o
          fabricados a medida pueden quedar excluidos del derecho de
          arrepentimiento, ya que no pueden revenderse. Aun así,{" "}
          <strong className="text-zinc-200">
            siempre cubrimos los defectos de fabricación
          </strong>{" "}
          y los errores respecto de lo acordado.
        </p>
      </LegalSection>

      <LegalSection number={8} title="Drops y reservas">
        <p>
          Las reservas de drops se abonan con una seña que asegura tu unidad.
          Por tratarse de una unidad reservada a tu nombre, la seña no se
          devuelve por arrepentimiento. Sí se devuelve el 100% si el drop no se
          concreta por causas de Craft3d.
        </p>
      </LegalSection>

      <LegalSection number={9} title="Contacto">
        <p>
          Para iniciar una devolución o consultar su estado, escribinos a{" "}
          {site.email} o por{" "}
          <Link href={site.whatsapp} className="text-cyan-300 hover:text-cyan-200">
            WhatsApp
          </Link>
          . Muchas dudas frecuentes están resueltas en la{" "}
          <Link href="/faq" className="text-cyan-300 hover:text-cyan-200">
            sección de preguntas frecuentes
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
