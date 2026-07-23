import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SiteHeader, SiteFooter } from "@/components/storefront";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

const CATS = [
  { slug: "", name: "Todo" },
  { slug: "anillos", name: "Anillos" },
  { slug: "collares", name: "Collares" },
  { slug: "aros", name: "Aros" },
  { slug: "pulseras", name: "Pulseras" },
];

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;

  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(cat ? { category: { slug: cat } } : {}),
    },
    include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="font-display text-ink text-4xl">Tienda</h1>
        <p className="text-muted mt-1">{products.length} piezas disponibles</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {CATS.map((c) => (
            <Link
              key={c.slug}
              href={c.slug ? `/tienda?cat=${c.slug}` : "/tienda"}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                (cat ?? "") === c.slug
                  ? "bg-sage text-cream"
                  : "border-line text-ink hover:bg-sand/50 border bg-white"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              slug={p.slug}
              name={p.name}
              price={p.basePrice}
              image={p.images[0]?.url}
              category={p.category?.name}
              featured={p.featured}
            />
          ))}
        </div>

        {products.length === 0 && (
          <p className="text-muted py-16 text-center">
            No hay productos en esta categoría.
          </p>
        )}
      </div>
      <SiteFooter />
    </>
  );
}
