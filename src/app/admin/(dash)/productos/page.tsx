import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatARS } from "@/lib/money";
import { Card, Badge, LinkButton } from "@/components/ui";

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

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-ink text-3xl">Productos</h1>
          <p className="text-muted mt-1 text-sm">{products.length} piezas cargadas</p>
        </div>
        <LinkButton href="/admin/productos/nuevo">+ Nuevo producto</LinkButton>
      </header>

      {products.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted mb-4">Todavía no cargaste productos.</p>
          <LinkButton href="/admin/productos/nuevo">Cargar el primero</LinkButton>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const stock = p.variants.reduce((a, v) => a + v.stock, 0);
            return (
              <Link key={p.id} href={`/admin/productos/${p.id}`}>
                <Card className="overflow-hidden transition-shadow hover:shadow-[0_8px_30px_-10px_rgba(59,74,63,0.25)]">
                  <div className="bg-sand relative aspect-square">
                    {p.images[0] && (
                      <Image
                        src={p.images[0].url}
                        alt={p.name}
                        fill
                        className="object-cover"
                        unoptimized
                        sizes="300px"
                      />
                    )}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      {p.featured && <Badge tone="gold">Destacado</Badge>}
                      {!p.active && <Badge tone="gray">Oculto</Badge>}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-muted text-xs">
                      {p.category?.name ?? "Sin categoría"}
                    </p>
                    <p className="text-ink mt-0.5 truncate font-medium">{p.name}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-display text-sage text-lg">
                        {formatARS(p.basePrice)}
                      </span>
                      <Badge tone={stock === 0 ? "red" : stock <= 3 ? "gold" : "sage"}>
                        {stock} en stock
                      </Badge>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
