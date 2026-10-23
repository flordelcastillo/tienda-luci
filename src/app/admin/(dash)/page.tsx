import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatARS } from "@/lib/money";
import { Card, Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

const DAYS_STALE = 30; // sin ventas en este período → candidato a oferta

function daysSince(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / 86_400_000);
}

export default async function DashboardPage() {
  const [productCount, activeCount, lowStock, recentOrders, paidAgg, pending, products, soldOrders] =
    await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { active: true } }),
      prisma.productVariant.findMany({
        where: { stock: { lte: 3 } },
        include: { product: true },
        orderBy: { stock: "asc" },
        take: 8,
      }),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.order.aggregate({
        where: { status: { in: ["PAID", "FULFILLED"] } },
        _sum: { total: true },
      }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.product.findMany({
        where: { active: true },
        include: {
          images: { orderBy: { position: "asc" }, take: 1 },
          variants: { select: { stock: true } },
        },
      }),
      // Órdenes reales (pagadas/enviadas) para calcular ventas y movimiento.
      prisma.order.findMany({
        where: { status: { in: ["PAID", "FULFILLED"] } },
        select: {
          createdAt: true,
          total: true,
          items: { select: { productId: true, quantity: true } },
        },
      }),
    ]);

  const revenue = paidAgg._sum.total ?? 0;

  // Movimiento por producto: última venta y unidades vendidas.
  const movement = new Map<string, { lastSold: Date | null; units: number }>();
  for (const o of soldOrders) {
    for (const it of o.items) {
      if (!it.productId) continue;
      const m = movement.get(it.productId) ?? { lastSold: null, units: 0 };
      m.units += it.quantity;
      if (!m.lastSold || o.createdAt > m.lastSold) m.lastSold = o.createdAt;
      movement.set(it.productId, m);
    }
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - DAYS_STALE);

  // Candidatos a oferta: activos, con stock, sin ventas recientes (o nunca vendidos).
  const stale = products
    .map((p) => {
      const m = movement.get(p.id);
      const stock = p.variants.reduce((a, v) => a + v.stock, 0);
      return {
        id: p.id,
        name: p.name,
        image: p.images[0]?.url ?? "",
        price: p.basePrice,
        onSale: p.compareAtPrice != null && p.compareAtPrice > p.basePrice,
        stock,
        units: m?.units ?? 0,
        lastSold: m?.lastSold ?? null,
      };
    })
    .filter((p) => p.stock > 0 && (p.lastSold === null || p.lastSold < cutoff))
    .sort((a, b) => {
      // Nunca vendidos primero; luego los de venta más antigua.
      if (!a.lastSold && !b.lastSold) return b.stock - a.stock;
      if (!a.lastSold) return -1;
      if (!b.lastSold) return 1;
      return a.lastSold.getTime() - b.lastSold.getTime();
    });

  // Ventas por mes (últimos 6 meses) para el gráfico.
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      year: d.getFullYear(),
      month: d.getMonth(),
      label: d.toLocaleDateString("es-AR", { month: "short" }),
      total: 0,
    };
  });
  for (const o of soldOrders) {
    const d = new Date(o.createdAt);
    const b = months.find((m) => m.year === d.getFullYear() && m.month === d.getMonth());
    if (b) b.total += o.total;
  }
  const maxMonth = Math.max(1, ...months.map((m) => m.total));

  const stats = [
    { label: "Ingresos (pagados)", value: formatARS(revenue) },
    { label: "Productos activos", value: `${activeCount} / ${productCount}` },
    { label: "Pedidos pendientes", value: String(pending) },
    { label: "Para ofertar", value: String(stale.length) },
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

      {/* Gráfico de ventas por mes */}
      <Card className="p-6">
        <h2 className="font-display text-ink mb-1 text-xl">Ventas por mes</h2>
        <p className="text-muted mb-6 text-sm">
          Facturación de pedidos pagados · últimos 6 meses
        </p>
        <div className="flex h-48 items-end gap-3">
          {months.map((m) => (
            <div key={`${m.year}-${m.month}`} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-muted text-[11px]">
                {m.total > 0 ? formatARS(m.total) : ""}
              </span>
              <div
                className="bg-sage/80 hover:bg-sage w-full rounded-t-md transition-all"
                style={{ height: `${Math.max(2, (m.total / maxMonth) * 100)}%` }}
                title={`${m.label}: ${formatARS(m.total)}`}
              />
              <span className="text-muted text-xs capitalize">{m.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Productos para poner en oferta */}
      <Card className="p-6">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-display text-ink text-xl">Productos para poner en oferta</h2>
          <Link href="/admin/productos" className="text-sage text-sm hover:underline">
            Ver productos →
          </Link>
        </div>
        <p className="text-muted mb-4 text-sm">
          Activos con stock y sin ventas en los últimos {DAYS_STALE} días.
        </p>
        {stale.length === 0 ? (
          <p className="text-muted text-sm">
            Todo se está moviendo bien. No hay productos estancados. 🎉
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="text-muted border-line border-b text-left text-xs tracking-wide uppercase">
                  <th className="py-3 font-medium">Producto</th>
                  <th className="py-3 text-center font-medium">Última venta</th>
                  <th className="py-3 text-center font-medium">Vendidos</th>
                  <th className="py-3 text-center font-medium">Stock</th>
                  <th className="py-3 text-right font-medium">Precio</th>
                </tr>
              </thead>
              <tbody>
                {stale.slice(0, 10).map((p) => (
                  <tr key={p.id} className="border-line border-b last:border-0">
                    <td className="py-3">
                      <Link
                        href={`/admin/productos/${p.id}`}
                        className="text-ink hover:text-sage text-sm"
                      >
                        {p.name}
                      </Link>
                      {p.onSale && (
                        <Badge tone="rose" className="ml-2">
                          En oferta
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 text-center text-sm">
                      {p.lastSold ? (
                        <span className="text-muted">hace {daysSince(p.lastSold)} días</span>
                      ) : (
                        <Badge tone="gold">Nunca</Badge>
                      )}
                    </td>
                    <td className="text-muted py-3 text-center text-sm">{p.units}</td>
                    <td className="py-3 text-center text-sm">{p.stock}</td>
                    <td className="text-ink py-3 text-right text-sm">{formatARS(p.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

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
          {recentOrders.length === 0 ? (
            <p className="text-muted text-sm">Todavía no hay pedidos.</p>
          ) : (
            <ul className="divide-line divide-y">
              {recentOrders.map((o) => (
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
