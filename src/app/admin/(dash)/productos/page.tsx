import { prisma } from "@/lib/prisma";
import { Card, LinkButton } from "@/components/ui";
import { BulkProductGrid, type AdminProduct } from "./BulkProductGrid";

export const dynamic = "force-dynamic";

export default async function ProductosPage() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      images: { orderBy: { position: "asc" }, take: 1 },
      variants: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const items: AdminProduct[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category?.name ?? null,
    image: p.images[0]?.url ?? null,
    basePrice: p.basePrice,
    stock: p.variants.reduce((a, v) => a + v.stock, 0),
    featured: p.featured,
    active: p.active,
  }));

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-ink text-3xl">Productos</h1>
          <p className="text-muted mt-1 text-sm">
            {products.length} piezas cargadas · seleccioná varias para editar en lote
          </p>
        </div>
        <LinkButton href="/admin/productos/nuevo">+ Nuevo producto</LinkButton>
      </header>

      {products.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted mb-4">Todavía no cargaste productos.</p>
          <LinkButton href="/admin/productos/nuevo">Cargar el primero</LinkButton>
        </Card>
      ) : (
        <BulkProductGrid products={items} />
      )}
    </div>
  );
}
