import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createPreference } from "@/lib/mercadopago";

const itemSchema = z.object({
  productId: z.string(),
  variantId: z.string(),
  quantity: z.number().int().positive(),
});

const schema = z.object({
  // Formato carrito (multi-item) …
  items: z.array(itemSchema).min(1).optional(),
  // … o formato single-item (compra directa desde el detalle de producto).
  productId: z.string().optional(),
  variantId: z.string().optional(),
  quantity: z.number().int().positive().optional(),
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().default(""),
    addr: z.string().default(""),
  }),
});

const SHIPPING_COST = 0; // configurable

// Une líneas repetidas (mismo producto+variante) sumando cantidades.
function mergeItems(items: z.infer<typeof itemSchema>[]) {
  const map = new Map<string, z.infer<typeof itemSchema>>();
  for (const it of items) {
    const key = `${it.productId}::${it.variantId}`;
    const prev = map.get(key);
    if (prev) prev.quantity += it.quantity;
    else map.set(key, { ...it });
  }
  return [...map.values()];
}

export async function POST(req: NextRequest) {
  let input;
  try {
    input = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  // Normaliza ambos formatos a una lista de ítems.
  const rawItems =
    input.items ??
    (input.productId && input.variantId && input.quantity
      ? [
          {
            productId: input.productId,
            variantId: input.variantId,
            quantity: input.quantity,
          },
        ]
      : []);

  if (rawItems.length === 0) {
    return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });
  }

  const items = mergeItems(rawItems);

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) }, active: true },
    include: { variants: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  // Valida cada línea y arma los ítems de la orden y de la preferencia MP.
  const orderItems = [];
  const prefItems = [];
  let subtotal = 0;

  for (const it of items) {
    const product = byId.get(it.productId);
    if (!product) {
      return NextResponse.json(
        { error: "Producto no disponible" },
        { status: 404 },
      );
    }
    const variant = product.variants.find((v) => v.id === it.variantId);
    if (!variant) {
      return NextResponse.json({ error: "Variante inválida" }, { status: 400 });
    }
    if (variant.stock < it.quantity) {
      return NextResponse.json(
        { error: `Stock insuficiente: ${product.name}` },
        { status: 409 },
      );
    }

    const unitPrice = product.basePrice + variant.priceDelta;
    const lineTotal = unitPrice * it.quantity;
    const nameSnapshot = `${product.name} · ${variant.name}`;
    subtotal += lineTotal;

    orderItems.push({
      productId: product.id,
      variantId: variant.id,
      nameSnapshot,
      unitPrice,
      quantity: it.quantity,
      lineTotal,
    });
    prefItems.push({
      title: nameSnapshot,
      quantity: it.quantity,
      unit_price: unitPrice / 100, // MP espera pesos
      currency_id: "ARS" as const,
    });
  }

  const total = subtotal + SHIPPING_COST;

  // Crea la orden en estado PENDING con su pago asociado.
  const order = await prisma.order.create({
    data: {
      customerName: input.customer.name,
      customerEmail: input.customer.email,
      customerPhone: input.customer.phone,
      shippingAddr: input.customer.addr,
      subtotal,
      shippingCost: SHIPPING_COST,
      total,
      items: { create: orderItems },
      payment: { create: { amount: total, status: "PENDING" } },
    },
  });

  try {
    const pref = await createPreference({
      orderId: order.id,
      orderNumber: order.number,
      payer: { name: input.customer.name, email: input.customer.email },
      items: prefItems,
    });

    await prisma.payment.update({
      where: { orderId: order.id },
      data: { mpPreferenceId: pref.preferenceId },
    });

    return NextResponse.json({
      initPoint: pref.initPoint,
      orderId: order.id,
      demo: pref.demo,
    });
  } catch (e) {
    console.error("Checkout error:", e);
    return NextResponse.json({ error: "No se pudo iniciar el pago" }, { status: 502 });
  }
}
