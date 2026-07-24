"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { DELIVERY_VALUES, needsAddress } from "@/lib/delivery";
import { deductStock } from "@/lib/stock";

// Pedido por transferencia/WhatsApp. Crea la Orden en estado PENDING con un pago
// "transfer" también PENDING; el vendedor la ve en /admin/pagos y la marca pagada
// cuando recibe la transferencia. Los precios se recalculan desde la base (no se
// confía en lo que manda el cliente).
const schema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string(),
        quantity: z.number().int().positive(),
        gift: z.boolean().default(false),
      }),
    )
    .min(1),
  customer: z.object({
    name: z.string().min(1),
    phone: z.string().min(1),
    addr: z.string().default(""),
    email: z.union([z.string().email(), z.literal("")]).default(""),
    deliveryZone: z.enum(DELIVERY_VALUES as [string, ...string[]]),
  }),
});

export type CreateOrderResult =
  | { ok: true; orderId: string; orderNumber: number }
  | { ok: false; error: string };

export async function createOrder(raw: unknown): Promise<CreateOrderResult> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Datos incompletos o inválidos" };
  const { items, customer } = parsed.data;

  // Para envíos a domicilio la dirección es obligatoria (el punto de encuentro no).
  if (needsAddress(customer.deliveryZone) && !customer.addr.trim()) {
    return { ok: false, error: "Completá la dirección para el envío." };
  }

  const productIds = [...new Set(items.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, active: true },
    include: { variants: true },
  });

  // Suma la cantidad pedida por variante (una misma variante puede venir en
  // líneas separadas: con y sin cajita de regalo).
  const wanted = new Map<string, number>();
  for (const it of items) {
    wanted.set(it.variantId, (wanted.get(it.variantId) ?? 0) + it.quantity);
  }

  const lines = [];
  for (const it of items) {
    const p = products.find((x) => x.id === it.productId);
    if (!p) return { ok: false, error: "Una de las piezas ya no está disponible" };
    const v = p.variants.find((x) => x.id === it.variantId);
    if (!v) return { ok: false, error: `Elegí una variante válida de ${p.name}` };
    // Control de sobreventa: no permitir pedir más de lo que hay en stock.
    if (v.stock < (wanted.get(it.variantId) ?? 0)) {
      return {
        ok: false,
        error: `No hay stock suficiente de ${p.name}${
          v.name && v.name !== "Único" ? ` (${v.name})` : ""
        }. Quedan ${v.stock}.`,
      };
    }
    const unitPrice = p.basePrice + v.priceDelta;
    lines.push({
      productId: p.id,
      variantId: v.id,
      nameSnapshot:
        `${p.name} · ${v.name}` + (it.gift ? " · con cajita de regalo" : ""),
      unitPrice,
      quantity: it.quantity,
      lineTotal: unitPrice * it.quantity,
    });
  }

  const subtotal = lines.reduce((a, l) => a + l.lineTotal, 0);
  const total = subtotal; // el envío se coordina por WhatsApp

  const order = await prisma.order.create({
    data: {
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      shippingAddr: customer.addr,
      deliveryZone: customer.deliveryZone,
      subtotal,
      shippingCost: 0,
      total,
      items: { create: lines },
      payment: { create: { provider: "transfer", amount: total, status: "PENDING" } },
    },
  });

  // La orden nace PENDING (estado activo): reservamos el stock de una vez.
  await deductStock(order.id);

  return { ok: true, orderId: order.id, orderNumber: order.number };
}
