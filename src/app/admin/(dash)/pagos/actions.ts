"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { OrderStatus } from "@/generated/prisma/enums";

const VALID: OrderStatus[] = ["PENDING", "PAID", "FULFILLED", "CANCELLED", "REFUNDED"];

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const session = await getSession();
  if (!session) return { error: "No autorizado" };
  if (!VALID.includes(status)) return { error: "Estado inválido" };

  await prisma.order.update({ where: { id: orderId }, data: { status } });

  // Sincroniza el estado del pago cuando corresponde.
  if (status === "PAID") {
    await prisma.payment.updateMany({
      where: { orderId },
      data: { status: "APPROVED" },
    });
  }
  if (status === "REFUNDED") {
    await prisma.payment.updateMany({
      where: { orderId },
      data: { status: "REFUNDED" },
    });
  }

  revalidatePath("/admin/pagos");
  revalidatePath(`/admin/pagos/${orderId}`);
  revalidatePath("/admin");
  return { ok: true };
}
