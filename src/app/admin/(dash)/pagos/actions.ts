"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { deductStock, restoreStock, isActiveStatus } from "@/lib/stock";
import type { OrderStatus } from "@/generated/prisma/enums";

const VALID: OrderStatus[] = ["PENDING", "PAID", "FULFILLED", "CANCELLED", "REFUNDED"];

// restoreStockChoice: solo aplica al pasar a CANCELLED/REFUNDED. true = devolver
// el stock al inventario; false = dejarlo descontado (p. ej. pieza perdida).
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  restoreStockChoice?: boolean,
) {
  const session = await getSession();
  if (!session) return { error: "No autorizado" };
  if (!VALID.includes(status)) return { error: "Estado inválido" };

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { error: "Pedido no encontrado" };

  await prisma.order.update({ where: { id: orderId }, data: { status } });

  // Sincroniza el estado del pago cuando corresponde.
  if (status === "PAID") {
    await prisma.payment.updateMany({ where: { orderId }, data: { status: "APPROVED" } });
  }
  if (status === "REFUNDED") {
    await prisma.payment.updateMany({ where: { orderId }, data: { status: "REFUNDED" } });
  }

  // Stock según el nuevo estado.
  if (isActiveStatus(status)) {
    // Volvió (o sigue) activo: asegura que el stock esté descontado.
    await deductStock(orderId);
  } else if (restoreStockChoice) {
    // Cancelado/reembolsado y el vendedor eligió devolver el stock.
    await restoreStock(orderId);
  }

  revalidatePath("/admin/pagos");
  revalidatePath(`/admin/pagos/${orderId}`);
  revalidatePath("/admin/inventario");
  revalidatePath("/admin");
  return { ok: true };
}
