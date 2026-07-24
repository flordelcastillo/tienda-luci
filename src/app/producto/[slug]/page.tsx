import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, Ruler, Droplets, Gift, Star, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SiteHeader, SiteFooter } from "@/components/storefront";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductCard } from "@/components/ProductCard";
import { Badge } from "@/components/ui";
import { buildProductMetadata } from "@/lib/product-meta";
import { formatARS } from "@/lib/money";
import { getSettings } from "@/lib/settings";
import { THEME_LABEL, labelFor } from "@/lib/product-attributes";
import { BuyBox } from "./BuyBox";
import { ReviewForm } from "./ReviewForm";

const AUDIENCE_LABEL: Record<string, string> = {
  mujer: "Mujer",
  hombre: "Hombre",
  ninos: "Niños",
  unisex: "Unisex",
};

export const dynamic = "force-dynamic";

// Trae solo lo necesario para armar los metadatos (nombre, descripción, portada).
async function getProduct(slug: string) {
  return prisma.product.findFirst({
    where: { slug, active: true },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: true,
      category: true,
      reviews: { where: { approved: true }, orderBy: { createdAt: "desc" } },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Producto no encontrado · Teia accesorios" };

  const meta = buildProductMetadata({
    name: product.name,
    description: product.description,
    material: product.material,
    gemstone: product.gemstone,
    category: product.category?.name,
    basePrice: product.basePrice,
    image: product.images[0]?.url,
  });

  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      images: meta.image ? [{ url: meta.image }] : undefined,
    },
  };
}

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  // "Combiná el look": piezas del mismo tema en OTRA categoría (dije + aros).
  const combo = product.theme
    ? await prisma.product.findMany({
        where: {
          active: true,
          theme: product.theme,
          id: { not: product.id },
          categoryId: product.categoryId ? { not: product.categoryId } : undefined,
        },
        include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true },
        take: 4,
      })
    : [];

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length
      : 0;

  const { freeShippingCents: FREE_SHIPPING_THRESHOLD } = await getSettings();
  const freeShip =
    FREE_SHIPPING_THRESHOLD > 0 && product.basePrice >= FREE_SHIPPING_THRESHOLD;

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Galería */}
          <ProductGallery
            name={product.name}
            images={product.images.map((img) => ({
              id: img.id,
              url: img.url,
              alt: img.alt,
            }))}
          />

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

            {/* Rating resumen */}
            {product.reviews.length > 0 && (
              <div className="mt-3 flex items-center gap-1.5 text-sm">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`size-4 ${
                        n <= Math.round(avgRating) ? "fill-gold text-gold" : "text-line"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-muted">
                  {avgRating.toFixed(1)} · {product.reviews.length} reseña
                  {product.reviews.length > 1 ? "s" : ""}
                </span>
              </div>
            )}

            {/* Badges de confianza */}
            <div className="mt-4 flex flex-wrap gap-2">
              {product.hypoallergenic && (
                <span className="text-sage bg-sage/10 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm">
                  <ShieldCheck className="size-4" />
                  Apto piel sensible
                </span>
              )}
              {product.waterproof && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-sm text-sky-700">
                  <Droplets className="size-4" />
                  Apto agua · no se oxida
                </span>
              )}
              {product.giftWrap && (
                <span className="text-gold-dark bg-gold/10 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm">
                  <Gift className="size-4" />
                  Cajita de regalo
                </span>
              )}
            </div>

            {product.description && (
              <p className="text-muted mt-5 leading-relaxed">{product.description}</p>
            )}

            {/* Ficha técnica */}
            <dl className="border-line mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t pt-6 text-sm">
              {product.material && (
                <>
                  <dt className="text-muted">Material</dt>
                  <dd className="text-ink">{product.material}</dd>
                </>
              )}
              {product.gemstone && (
                <>
                  <dt className="text-muted">Piedra</dt>
                  <dd className="text-ink">{product.gemstone}</dd>
                </>
              )}
              {product.measurements && (
                <>
                  <dt className="text-muted">Medidas</dt>
                  <dd className="text-ink">{product.measurements}</dd>
                </>
              )}
              <dt className="text-muted">Para</dt>
              <dd className="text-ink">
                {AUDIENCE_LABEL[product.audience] ?? product.audience}
              </dd>
            </dl>

            <Link
              href="/guia-de-talles"
              className="text-sage hover:text-sage/80 mt-4 inline-flex items-center gap-1.5 text-sm underline underline-offset-2"
            >
              <Ruler className="size-4" />
              ¿Cómo saber mi talle?
            </Link>

            <div className="mt-8">
              <BuyBox
                productId={product.id}
                productName={product.name}
                slug={product.slug}
                image={product.images[0]?.url ?? ""}
                basePrice={product.basePrice}
                compareAtPrice={product.compareAtPrice}
                giftWrap={product.giftWrap}
                variants={product.variants.map((v) => ({
                  id: v.id,
                  name: v.name,
                  priceDelta: v.priceDelta,
                  stock: v.stock,
                }))}
              />
            </div>

            {/* Envío gratis / anzuelo */}
            {freeShip && (
              <p className="text-sage mt-4 inline-flex items-center gap-1.5 text-sm font-medium">
                <Truck className="size-4" />
                ¡Esta pieza tiene envío gratis!
              </p>
            )}
            {!freeShip && FREE_SHIPPING_THRESHOLD > 0 && (
              <p className="text-muted mt-4 inline-flex items-center gap-1.5 text-sm">
                <Truck className="size-4" />
                Envío gratis en compras desde {formatARS(FREE_SHIPPING_THRESHOLD)}
              </p>
            )}
          </div>
        </div>

        {/* Combiná el look (mismo tema, otra categoría) */}
        {combo.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display text-ink text-2xl">
              Combiná el look
              {product.theme && (
                <span className="text-muted text-base font-normal">
                  {" "}
                  · tema {labelFor(THEME_LABEL, product.theme)}
                </span>
              )}
            </h2>
            <p className="text-muted mt-1 text-sm">
              Llevá el set completo y armá tu combo del mismo estilo.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-6 lg:grid-cols-4">
              {combo.map((p) => (
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
          </section>
        )}

        {/* Reseñas */}
        <section className="mt-20">
          <h2 className="font-display text-ink text-2xl">Lo que dicen las clientas</h2>
          {product.reviews.length > 0 ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {product.reviews.map((r) => (
                <div
                  key={r.id}
                  className="border-line rounded-[var(--radius-card)] border bg-white p-5"
                >
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={`size-4 ${
                          n <= r.rating ? "fill-gold text-gold" : "text-line"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-ink mt-3 text-sm leading-relaxed">{r.text}</p>
                  <p className="text-muted mt-3 text-xs font-medium">— {r.author}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted mt-2 text-sm">
              Todavía no hay reseñas de esta pieza. ¡Sé la primera en dejar la tuya!
            </p>
          )}
          <div className="mt-8 max-w-xl">
            <ReviewForm slug={product.slug} />
          </div>
        </section>
      </div>
      <SiteFooter />
    </>
  );
}
