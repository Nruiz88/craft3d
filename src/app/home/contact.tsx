import SectionHeading from "@/components/ui/section-heading";
import { site } from "@/lib/utils/site";

export default function ContactSection() {
  return (
    <section id="contacto" className="border-t border-zinc-800">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="¿Tenés dudas o querés algo a medida?"
          title="Contacto y redes"
          description="Escribinos por Instagram, WhatsApp o mail. También hacemos piezas personalizadas."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <a
            href={site.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 transition-colors hover:border-amber-400/50"
          >
            <span className="text-3xl" aria-hidden="true">📷</span>
            <div>
              <h3 className="font-semibold text-zinc-100 group-hover:text-amber-300">Instagram</h3>
              <p className="text-sm text-zinc-500">{site.instagramLabel}</p>
            </div>
          </a>
          <a
            href={site.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 transition-colors hover:border-emerald-400/50"
          >
            <span className="text-3xl" aria-hidden="true">💬</span>
            <div>
              <h3 className="font-semibold text-zinc-100 group-hover:text-emerald-300">WhatsApp</h3>
              <p className="text-sm text-zinc-500">{site.whatsappLabel}</p>
            </div>
          </a>
          <a
            href={`mailto:${site.email}`}
            className="group flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 transition-colors hover:border-sky-400/50"
          >
            <span className="text-3xl" aria-hidden="true">✉️</span>
            <div>
              <h3 className="font-semibold text-zinc-100 group-hover:text-sky-300">Email</h3>
              <p className="text-sm text-zinc-500">{site.email}</p>
            </div>
          </a>
        </div>
        <p className="mt-6 text-center text-xs text-zinc-600">
          Los datos de contacto son de ejemplo. Editá `lib/site.ts` con tus redes reales.
        </p>
      </div>
    </section>
  );
}
