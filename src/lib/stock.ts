import { prisma } from "./prisma";

// Manejo de stock atado al estado del pedido.
// - Al crear la orden o al pasarla a un estado activo (pendiente/pagado/enviado)
//   se descuenta el stock una sola vez (bandera Order.stockApplied).
// - Al cancelar/reembolsar, opcionalmente se repone (lo decide el vendedor).

const ACTIVE_STATUSES = ["PENDING", "PAID", "FULFILLED"];

export function isActiveStatus(status: string): boolean {
  return ACTIVE_STATUSES.includes(status);
}

/** Descuenta el stock de las variantes del pedido (si aún no se aplicó). */
export async function deductStock(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order || order.stockApplied) return;

  await prisma.$transaction([
    ...order.items
      .filter((i) => i.variantId)
      .map((i) =>
        prisma.productVariant.update({
          where: { id: i.variantId! },
          data: { stock: { decrement: i.quantity } },
        }),
      ),
    prisma.order.update({ where: { id: orderId }, data: { stockApplied: true } }),
  ]);
}

/** Repone el stock de las variantes del pedido (si estaba descontado). */
export async function restoreStock(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order || !order.stockApplied) return;

  await prisma.$transaction([
    ...order.items
      .filter((i) => i.variantId)
      .map((i) =>
        prisma.productVariant.update({
          where: { id: i.variantId! },
          data: { stock: { increment: i.quantity } },
        }),
      ),
    prisma.order.update({ where: { id: orderId }, data: { stockApplied: false } }),
  ]);
}
