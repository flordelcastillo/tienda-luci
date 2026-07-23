import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatARS } from "@/lib/money";
import { SiteHeader, SiteFooter } from "@/components/storefront";
import { simulatePayment } from "./actions";

export const dynamic = "force-dynamic";

// Pantalla de checkout SIMULADO — sólo se usa cuando no hay credenciales de
// Mercado Pago configuradas (MP_ACCESS_TOKEN vacío). Permite probar el flujo
// completo (orden → pago aprobado → descuento de stock) en desarrollo.
export default async function DemoCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;
  if (!orderId) notFound();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) notFound();

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-md px-6 py-16">
        <div className="border-line rounded-[var(--radius-card)] border bg-white p-8 text-center">
          <p className="text-gold-dark text-xs tracking-[0.2em] uppercase">
            Checkout de prueba
          </p>
          <h1 className="font-display text-ink mt-2 text-2xl">Pedido #{order.number}</h1>
          <p className="text-muted mt-1 text-sm">
            Modo demo (sin credenciales de Mercado Pago)
          </p>

          <div className="my-6 space-y-2 text-left">
            {order.items.map((it) => (
              <div key={it.id} className="flex justify-between text-sm">
                <span className="text-ink">
                  {it.nameSnapshot} × {it.quantity}
                </span>
                <span>{formatARS(it.lineTotal)}</span>
              </div>
            ))}
            <div className="border-line flex justify-between border-t pt-2 font-medium">
              <span>Total</span>
              <span className="text-sage">{formatARS(order.total)}</span>
            </div>
          </div>

          <form action={simulatePayment} className="space-y-2">
            <input type="hidden" name="orderId" value={order.id} />
            <button
              name="result"
              value="approved"
              className="bg-sage text-cream w-full rounded-full px-6 py-3 text-sm"
            >
              Simular pago aprobado
            </button>
            <button
              name="result"
              value="rejected"
              className="border-line text-muted w-full rounded-full border px-6 py-3 text-sm"
            >
              Simular pago rechazado
            </button>
          </form>
        </div>
        <p className="mt-4 text-center">
          <Link href="/tienda" className="text-muted hover:text-sage text-sm">
            ← Volver a la tienda
          </Link>
        </p>
      </div>
      <SiteFooter />
    </>
  );
}
