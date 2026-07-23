import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatARS } from "@/lib/money";
import { Card } from "@/components/ui";
import { OrderStatusBadge, PaymentStatusBadge } from "../StatusBadge";
import { StatusControls } from "./StatusControls";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, payment: true },
  });

  if (!order) notFound();

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <Link href="/admin/pagos" className="text-sage text-sm hover:underline">
          ← Volver a pagos
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="font-display text-ink text-3xl">Pedido #{order.number}</h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="text-muted mt-1 text-sm">
          {new Date(order.createdAt).toLocaleString("es-AR")}
        </p>
      </div>

      <Card className="p-6">
        <h2 className="font-display text-ink mb-3 text-lg">Acciones</h2>
        <StatusControls orderId={order.id} current={order.status} />
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="space-y-2 p-6">
          <h2 className="font-display text-ink mb-2 text-lg">Cliente</h2>
          <Info label="Nombre" value={order.customerName} />
          <Info label="Email" value={order.customerEmail} />
          <Info label="Teléfono" value={order.customerPhone || "—"} />
          <Info label="Envío" value={order.shippingAddr || "—"} />
        </Card>

        <Card className="space-y-2 p-6">
          <h2 className="font-display text-ink mb-2 text-lg">Pago</h2>
          {order.payment ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-muted text-sm">Estado</span>
                <PaymentStatusBadge status={order.payment.status} />
              </div>
              <Info label="Proveedor" value={order.payment.provider} />
              <Info label="ID de pago (MP)" value={order.payment.mpPaymentId || "—"} />
              <Info label="Método" value={order.payment.method || "—"} />
            </>
          ) : (
            <p className="text-muted text-sm">Sin registro de pago.</p>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="font-display text-ink mb-4 text-lg">Ítems</h2>
        <table className="w-full">
          <thead>
            <tr className="text-muted border-line border-b text-left text-xs tracking-wide uppercase">
              <th className="pb-2 font-medium">Producto</th>
              <th className="pb-2 text-center font-medium">Cant.</th>
              <th className="pb-2 text-right font-medium">Precio</th>
              <th className="pb-2 text-right font-medium">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((it) => (
              <tr key={it.id} className="border-line border-b last:border-0">
                <td className="text-ink py-3 text-sm">{it.nameSnapshot}</td>
                <td className="py-3 text-center text-sm">{it.quantity}</td>
                <td className="py-3 text-right text-sm">{formatARS(it.unitPrice)}</td>
                <td className="py-3 text-right text-sm font-medium">
                  {formatARS(it.lineTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 ml-auto max-w-xs space-y-1 text-sm">
          <Row label="Subtotal" value={formatARS(order.subtotal)} />
          <Row label="Envío" value={formatARS(order.shippingCost)} />
          <div className="border-line mt-2 border-t pt-2">
            <Row label="Total" value={formatARS(order.total)} bold />
          </div>
        </div>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted text-sm">{label}</span>
      <span className="text-ink text-right text-sm">{value}</span>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className={bold ? "text-ink font-medium" : "text-muted"}>{label}</span>
      <span className={bold ? "font-display text-sage text-lg" : "text-ink"}>
        {value}
      </span>
    </div>
  );
}
