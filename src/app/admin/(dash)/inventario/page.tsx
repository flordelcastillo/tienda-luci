import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui";
import { StockRow } from "./StockRow";

export const dynamic = "force-dynamic";

export default async function InventarioPage() {
  const variants = await prisma.productVariant.findMany({
    include: { product: true },
    orderBy: [{ stock: "asc" }, { product: { name: "asc" } }],
  });

  const totalUnits = variants.reduce((a, v) => a + v.stock, 0);
  const outOfStock = variants.filter((v) => v.stock === 0).length;

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-ink text-3xl">Inventario</h1>
          <p className="text-muted mt-1 text-sm">
            {variants.length} variantes · {totalUnits} unidades · {outOfStock} sin stock
          </p>
        </div>
      </header>

      <Card className="overflow-x-auto p-6">
        <table className="w-full min-w-[560px]">
          <thead>
            <tr className="text-muted border-line border-b text-left text-xs tracking-wide uppercase">
              <th className="pr-4 pb-3 font-medium">Producto</th>
              <th className="pr-4 pb-3 font-medium">SKU</th>
              <th className="pr-4 pb-3 font-medium">Estado</th>
              <th className="pb-3 font-medium">Stock</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v) => (
              <StockRow
                key={v.id}
                variantId={v.id}
                productName={v.product.name}
                variantName={v.name}
                sku={v.sku}
                initialStock={v.stock}
              />
            ))}
          </tbody>
        </table>
        {variants.length === 0 && (
          <p className="text-muted py-6 text-center text-sm">
            No hay variantes cargadas todavía.
          </p>
        )}
      </Card>
    </div>
  );
}
