import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatARS } from "@/lib/money";
import { Card } from "@/components/ui";
import { OrderStatusBadge, PaymentStatusBadge } from "./StatusBadge";
import type { OrderStatus } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "PENDING", label: "Pendientes" },
  { key: "PAID", label: "Pagados" },
  { key: "FULFILLED", label: "Enviados" },
  { key: "CANCELLED", label: "Cancelados" },
];

export default async function PagosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado = "all" } = await searchParams;
  const where = estado !== "all" ? { status: estado as OrderStatus } : {};

  const [orders, totals] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { payment: true, items: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.aggregate({
      where: { status: { in: ["PAID", "FULFILLED"] } },
      _sum: { total: true },
      _count: true,
    }),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-ink text-3xl">Pagos y pedidos</h1>
          <p className="text-muted mt-1 text-sm">
            {totals._count} pagados · {formatARS(totals._sum.total ?? 0)} facturado
          </p>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/admin/pagos?estado=${f.key}`}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              estado === f.key
                ? "bg-sage text-cream"
                : "border-line text-ink hover:bg-sand/50 border bg-white"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="text-muted border-line border-b text-left text-xs tracking-wide uppercase">
              <th className="px-6 py-4 font-medium">Pedido</th>
              <th className="px-4 py-4 font-medium">Cliente</th>
              <th className="px-4 py-4 font-medium">Fecha</th>
              <th className="px-4 py-4 font-medium">Total</th>
              <th className="px-4 py-4 font-medium">Pago</th>
              <th className="px-6 py-4 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr
                key={o.id}
                className="border-line hover:bg-cream/60 border-b last:border-0"
              >
                <td className="px-6 py-4">
                  <Link
                    href={`/admin/pagos/${o.id}`}
                    className="text-sage font-medium hover:underline"
                  >
                    #{o.number}
                  </Link>
                  <p className="text-muted text-xs">{o.items.length} ítems</p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-ink text-sm">{o.customerName}</p>
                  <p className="text-muted text-xs">{o.customerEmail}</p>
                </td>
                <td className="text-muted px-4 py-4 text-sm">
                  {new Date(o.createdAt).toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "short",
                  })}
                </td>
                <td className="text-ink px-4 py-4 text-sm font-medium">
                  {formatARS(o.total)}
                </td>
                <td className="px-4 py-4">
                  {o.payment ? (
                    <PaymentStatusBadge status={o.payment.status} />
                  ) : (
                    <span className="text-muted text-xs">—</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <OrderStatusBadge status={o.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="text-muted py-10 text-center text-sm">
            No hay pedidos {estado !== "all" ? "con este estado" : "todavía"}.
          </p>
        )}
      </Card>
    </div>
  );
}
