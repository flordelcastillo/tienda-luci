import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPayment, mapPaymentStatus } from "@/lib/mercadopago";

// Recibe notificaciones de Mercado Pago cuando cambia el estado de un pago.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const type = body.type ?? req.nextUrl.searchParams.get("type");
    const paymentId = body?.data?.id ?? req.nextUrl.searchParams.get("data.id");

    if (type !== "payment" || !paymentId) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const mpPayment = await getPayment(String(paymentId));
    if (!mpPayment) return NextResponse.json({ ok: true });

    const orderId = mpPayment.external_reference as string | undefined;
    if (!orderId) return NextResponse.json({ ok: true });

    const status = mapPaymentStatus(mpPayment.status);

    await prisma.payment.updateMany({
      where: { orderId },
      data: {
        status,
        mpPaymentId: String(mpPayment.id),
        method: mpPayment.payment_method_id ?? "",
      },
    });

    // Si se aprobó, marcamos la orden como pagada y descontamos stock.
    if (status === "APPROVED") {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
      if (order && order.status === "PENDING") {
        await prisma.$transaction(async (tx) => {
          await tx.order.update({ where: { id: orderId }, data: { status: "PAID" } });
          for (const item of order.items) {
            if (item.variantId) {
              await tx.productVariant.update({
                where: { id: item.variantId },
                data: { stock: { decrement: item.quantity } },
              });
            }
          }
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Webhook MP error:", e);
    return NextResponse.json({ ok: false }, { status: 200 }); // 200 para evitar reintentos infinitos
  }
}
