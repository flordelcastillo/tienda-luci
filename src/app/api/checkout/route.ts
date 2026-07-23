import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createPreference } from "@/lib/mercadopago";

const schema = z.object({
  productId: z.string(),
  variantId: z.string(),
  quantity: z.number().int().positive(),
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().default(""),
    addr: z.string().default(""),
  }),
});

const SHIPPING_COST = 0; // configurable

export async function POST(req: NextRequest) {
  let input;
  try {
    input = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({
    where: { id: input.productId },
    include: { variants: true },
  });
  if (!product || !product.active) {
    return NextResponse.json({ error: "Producto no disponible" }, { status: 404 });
  }

  const variant = product.variants.find((v) => v.id === input.variantId);
  if (!variant) {
    return NextResponse.json({ error: "Variante inválida" }, { status: 400 });
  }
  if (variant.stock < input.quantity) {
    return NextResponse.json({ error: "Stock insuficiente" }, { status: 409 });
  }

  const unitPrice = product.basePrice + variant.priceDelta;
  const lineTotal = unitPrice * input.quantity;
  const total = lineTotal + SHIPPING_COST;
  const nameSnapshot = `${product.name} · ${variant.name}`;

  // Crea la orden en estado PENDING con su pago asociado.
  const order = await prisma.order.create({
    data: {
      customerName: input.customer.name,
      customerEmail: input.customer.email,
      customerPhone: input.customer.phone,
      shippingAddr: input.customer.addr,
      subtotal: lineTotal,
      shippingCost: SHIPPING_COST,
      total,
      items: {
        create: [
          {
            productId: product.id,
            variantId: variant.id,
            nameSnapshot,
            unitPrice,
            quantity: input.quantity,
            lineTotal,
          },
        ],
      },
      payment: {
        create: { amount: total, status: "PENDING" },
      },
    },
  });

  try {
    const pref = await createPreference({
      orderId: order.id,
      orderNumber: order.number,
      payer: { name: input.customer.name, email: input.customer.email },
      items: [
        {
          title: nameSnapshot,
          quantity: input.quantity,
          unit_price: unitPrice / 100, // MP espera pesos
          currency_id: "ARS",
        },
      ],
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
