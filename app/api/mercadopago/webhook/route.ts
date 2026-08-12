import { NextResponse } from "next/server";
import { getPaymentSettings } from "@/lib/settings";
import {
  getMercadoPagoPayment,
  verifyWebhookSignature,
} from "@/lib/mercadopago";
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

  const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET?.trim();
  if (webhookSecret) {
    const valid = verifyWebhookSignature({
      signatureHeader: request.headers.get("x-signature"),
      requestId: request.headers.get("x-request-id"),
      bodyId: paymentId,
      secret: webhookSecret,
    });
    if (!valid) {
      return new NextResponse("Firma inválida", { status: 401 });
    }
  }

  try {
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
    if (!order) return new NextResponse("OK", { status: 200 });

    const expected =
      order.isReservation && order.depositPaid > 0 ? order.depositPaid : order.total;
    const paid = Number(payment.transactionAmount ?? 0);
    if (Math.abs(paid - expected) > 1) {
      return new NextResponse("Monto no coincide", { status: 200 });
    }

    if (order.isReservation) {
      const transitioned = await markReservationDepositPaid(orderId, paymentId);
      if (transitioned) {
        const updated = await getOrderById(orderId);
        if (updated) await sendReservationDepositPaidEmail(updated);
      }
    } else {
      const transitioned = await markOrderPaid(orderId, paymentId);
      if (transitioned) {
        const updated = await getOrderById(orderId);
        if (updated) {
          await awardPurchase(updated);
          await sendOrderPaidEmail(updated);
        }
      }
    }
  } catch {
    // Nunca fallar el webhook en un error: Mercado Pago reintentaría
  }

  return new NextResponse("OK", { status: 200 });
}
