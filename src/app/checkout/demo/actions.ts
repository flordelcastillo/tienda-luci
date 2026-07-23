"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

// Simula el resultado de un pago en modo demo (sin Mercado Pago real).
export async function simulatePayment(formData: FormData) {
  const orderId = String(formData.get("orderId") ?? "");
  const result = String(formData.get("result") ?? "");
  if (!orderId) redirect("/tienda");

  if (result === "approved") {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (order && order.status === "PENDING") {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({ where: { id: orderId }, data: { status: "PAID" } });
        await tx.payment.updateMany({
          where: { orderId },
          data: { status: "APPROVED", method: "demo", mpPaymentId: `demo-${Date.now()}` },
        });
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
    redirect("/checkout/exito");
  }

  await prisma.payment.updateMany({
    where: { orderId },
    data: { status: "REJECTED" },
  });
  redirect("/checkout/error");
}
