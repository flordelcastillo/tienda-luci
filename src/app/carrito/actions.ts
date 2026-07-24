"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { DELIVERY_VALUES, needsAddress } from "@/lib/delivery";
import { deductStock } from "@/lib/stock";
import { sendOrderNotification } from "@/lib/email";
import { normalizeCode, couponError, computeDiscount, couponSummary } from "@/lib/coupons";

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
  couponCode: z.string().default(""),
});

// Busca y valida un cupón contra un subtotal. Usada por el carrito para mostrar
// el descuento antes de confirmar, y por createOrder para recalcularlo en firme.
export type CouponPreview =
  | { ok: true; code: string; discount: number; summary: string }
  | { ok: false; error: string };

export async function previewCoupon(
  rawCode: string,
  subtotal: number,
): Promise<CouponPreview> {
  const code = normalizeCode(String(rawCode ?? ""));
  if (!code) return { ok: false, error: "Ingresá un código." };
  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon) return { ok: false, error: "El cupón no existe." };
  const err = couponError(coupon, subtotal);
  if (err) return { ok: false, error: err };
  return {
    ok: true,
    code,
    discount: computeDiscount(coupon, subtotal),
    summary: couponSummary(coupon),
  };
}

export type CreateOrderResult =
  | {
      ok: true;
      orderId: string;
      orderNumber: number;
      discount: number;
      total: number;
      couponCode: string;
    }
  | { ok: false; error: string };

export async function createOrder(raw: unknown): Promise<CreateOrderResult> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Datos incompletos o inválidos" };
  const { items, customer, couponCode } = parsed.data;

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

  const lines: {
    productId: string;
    variantId: string;
    nameSnapshot: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }[] = [];
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

  // Cupón (opcional): se revalida en firme acá; nunca se confía en el descuento
  // que calculó el cliente. Si el código ya no aplica, se ignora sin romper el pedido.
  let appliedCode = "";
  let discount = 0;
  const code = normalizeCode(couponCode);
  if (code) {
    const coupon = await prisma.coupon.findUnique({ where: { code } });
    if (coupon && !couponError(coupon, subtotal)) {
      discount = computeDiscount(coupon, subtotal);
      appliedCode = code;
    }
  }
  const total = subtotal - discount; // el envío se coordina por WhatsApp

  // Creamos la orden y, si hubo cupón, contamos el uso en la misma transacción.
  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        shippingAddr: customer.addr,
        deliveryZone: customer.deliveryZone,
        subtotal,
        shippingCost: 0,
        couponCode: appliedCode,
        discount,
        total,
        items: { create: lines },
        payment: { create: { provider: "transfer", amount: total, status: "PENDING" } },
      },
    });
    if (appliedCode) {
      await tx.coupon.update({
        where: { code: appliedCode },
        data: { usedCount: { increment: 1 } },
      });
    }
    return created;
  });

  // La orden nace PENDING (estado activo): reservamos el stock de una vez.
  await deductStock(order.id);

  // Aviso por mail a la tienda (no bloquea ni falla si no hay SMTP configurado).
  await sendOrderNotification({
    number: order.number,
    customerName: customer.name,
    customerPhone: customer.phone,
    customerEmail: customer.email,
    deliveryZone: customer.deliveryZone,
    shippingAddr: customer.addr,
    total,
    items: lines.map((l) => ({
      nameSnapshot: l.nameSnapshot,
      quantity: l.quantity,
      lineTotal: l.lineTotal,
    })),
  });

  return {
    ok: true,
    orderId: order.id,
    orderNumber: order.number,
    discount,
    total,
    couponCode: appliedCode,
  };
}
