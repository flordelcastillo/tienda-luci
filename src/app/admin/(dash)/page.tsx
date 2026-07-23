import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatARS } from "@/lib/money";
import { Card, Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [productCount, activeCount, lowStock, orders, paidAgg, pending] =
    await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { active: true } }),
      prisma.productVariant.findMany({
        where: { stock: { lte: 3 } },
        include: { product: true },
        orderBy: { stock: "asc" },
        take: 8,
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.order.aggregate({
        where: { status: { in: ["PAID", "FULFILLED"] } },
        _sum: { total: true },
      }),
      prisma.order.count({ where: { status: "PENDING" } }),
    ]);

  const revenue = paidAgg._sum.total ?? 0;

  const stats = [
    { label: "Ingresos (pagados)", value: formatARS(revenue) },
    { label: "Productos activos", value: `${activeCount} / ${productCount}` },
    { label: "Pedidos pendientes", value: String(pending) },
    { label: "Stock bajo", value: String(lowStock.length) },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-ink text-3xl">Panel</h1>
        <p className="text-muted mt-1 text-sm">Resumen de la tienda</p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <p className="text-muted text-xs tracking-wide uppercase">{s.label}</p>
            <p className="font-display text-sage mt-2 text-2xl">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-ink text-xl">Stock bajo</h2>
            <Link href="/admin/inventario" className="text-sage text-sm hover:underline">
              Ver inventario →
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-muted text-sm">Todo el stock está en buen nivel.</p>
          ) : (
            <ul className="divide-line divide-y">
              {lowStock.map((v) => (
                <li key={v.id} className="flex items-center justify-between py-2.5">
                  <div className="min-w-0">
                    <p className="text-ink truncate text-sm">{v.product.name}</p>
                    <p className="text-muted text-xs">
                      {v.name} · {v.sku}
                    </p>
                  </div>
                  <Badge tone={v.stock === 0 ? "red" : "gold"}>{v.stock} u.</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-ink text-xl">Últimos pedidos</h2>
            <Link href="/admin/pagos" className="text-sage text-sm hover:underline">
              Ver todos →
            </Link>
          </div>
          {orders.length === 0 ? (
            <p className="text-muted text-sm">Todavía no hay pedidos.</p>
          ) : (
            <ul className="divide-line divide-y">
              {orders.map((o) => (
                <li key={o.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-ink text-sm">
                      #{o.number} · {o.customerName}
                    </p>
                    <p className="text-muted text-xs">
                      {new Date(o.createdAt).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-ink text-sm">{formatARS(o.total)}</p>
                    <OrderStatusBadge status={o.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, { tone: "gold" | "sage" | "gray" | "red"; label: string }> = {
    PENDING: { tone: "gold", label: "Pendiente" },
    PAID: { tone: "sage", label: "Pagado" },
    FULFILLED: { tone: "sage", label: "Enviado" },
    CANCELLED: { tone: "red", label: "Cancelado" },
    REFUNDED: { tone: "gray", label: "Reembolsado" },
  };
  const s = map[status] ?? { tone: "gray" as const, label: status };
  return <Badge tone={s.tone}>{s.label}</Badge>;
}
