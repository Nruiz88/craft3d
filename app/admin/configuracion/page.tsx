import { requireAdmin } from "@/lib/auth";
import {
  getPaymentSettings,
  getReservationSettings,
} from "@/lib/settings";
import SettingsForm from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();

  const [settings, reservation] = await Promise.all([
    getPaymentSettings(),
    getReservationSettings(),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-widest text-amber-400">
          Panel de administración
        </p>
        <h1 className="mt-1 text-3xl font-bold text-zinc-50">Configuración</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Medios de pago de la tienda y reservas de drops.
        </p>
      </div>

      <SettingsForm
        mercadopagoConfigured={Boolean(settings.mercadopago.accessToken)}
        publicKeyConfigured={Boolean(settings.mercadopago.publicKey)}
        transfer={settings.transfer}
        reservation={{
          enabled: reservation.enabled,
          mode: reservation.mode,
          depositPct: reservation.depositPct,
          depositFixed: reservation.depositFixed,
          note: reservation.note,
        }}
      />
    </div>
  );
}
