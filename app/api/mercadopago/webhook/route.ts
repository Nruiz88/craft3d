import { NextResponse } from "next/server";
import { getPaymentSettings } from "@/lib/settings";
import { getMercadoPagoPayment } from "@/lib/mercadopago";
import {
  getOrderById,
  markOrderPaid,
  markReservationDepositPaid,
} from "@/lib/orders";
import { awardPurchase } from "@/lib/gamification";
import { sendOrderPaidEmail, sendReservationDepositPaidEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET() {
  return new NextResponse("OK", { status: 200 });
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return new NextResponse("OK", { status: 200 });
  }

  try {
    const data = payload as {
      type?: string;
      action?: string;
      data?: { id?: string | number };
    };

    const type = data?.type ?? data?.action ?? "";
    if (type !== "payment") {
      return new NextResponse("OK", { status: 200 });
    }

    const paymentId = String(data?.data?.id ?? "");
    if (!paymentId) return new NextResponse("OK", { status: 200 });

    const settings = await getPaymentSettings();
    const accessToken = settings.mercadopago.accessToken.trim();
    if (!accessToken) return new NextResponse("OK", { status: 200 });

    const payment = await getMercadoPagoPayment({ accessToken, paymentId });
    if (payment.status !== "approved") {
      return new NextResponse("OK", { status: 200 });
    }

    const orderId = Number(payment.externalReference);
    if (!Number.isInteger(orderId) || orderId <= 0) {
      return new NextResponse("OK", { status: 200 });
    }

    const order = await getOrderById(orderId);
    if (order?.isReservation) {
      const transitioned = await markReservationDepositPaid(orderId, paymentId);
      if (transitioned) {
        const paid = await getOrderById(orderId);
        if (paid) await sendReservationDepositPaidEmail(paid);
      }
    } else {
      const transitioned = await markOrderPaid(orderId, paymentId);
      if (transitioned) {
        const paid = await getOrderById(orderId);
        if (paid) {
          await awardPurchase(paid);
          await sendOrderPaidEmail(paid);
        }
      }
    }
  } catch {
    // Nunca fallar el webhook en un error: Mercado Pago reintentaría
  }

  return new NextResponse("OK", { status: 200 });
}
