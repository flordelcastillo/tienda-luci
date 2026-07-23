import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SiteHeader, SiteFooter } from "@/components/storefront";
import { Badge } from "@/components/ui";
import { BuyBox } from "./BuyBox";

export const dynamic = "force-dynamic";

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, active: true },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: true,
      category: true,
    },
  });

  if (!product) notFound();

  const cover = product.images[0]?.url;

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Galería */}
          <div className="space-y-3">
            <div className="bg-sand aspect-square overflow-hidden rounded-[var(--radius-card)]">
              {cover && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cover}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.slice(0, 4).map((img) => (
                  <div
                    key={img.id}
                    className="bg-sand aspect-square overflow-hidden rounded-xl"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.alt}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info + compra */}
          <div>
            {product.category && (
              <p className="text-gold-dark text-xs tracking-[0.2em] uppercase">
                {product.category.name}
              </p>
            )}
            <h1 className="font-display text-ink mt-2 text-4xl">{product.name}</h1>

            <div className="mt-3 flex gap-2">
              {product.material && <Badge tone="rose">{product.material}</Badge>}
              {product.gemstone && <Badge tone="gold">{product.gemstone}</Badge>}
            </div>

            {product.description && (
              <p className="text-muted mt-5 leading-relaxed">{product.description}</p>
            )}

            <div className="mt-8">
              <BuyBox
                productId={product.id}
                basePrice={product.basePrice}
                variants={product.variants.map((v) => ({
                  id: v.id,
                  name: v.name,
                  priceDelta: v.priceDelta,
                  stock: v.stock,
                }))}
              />
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
