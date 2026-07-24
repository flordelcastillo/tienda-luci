import Link from "next/link";
import { Droplets, Gift } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SiteHeader, SiteFooter } from "@/components/storefront";
import { ProductCard } from "@/components/ProductCard";
import { LinkButton } from "@/components/ui";
import { formatARS } from "@/lib/money";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  { slug: "collares", name: "Collares" },
  { slug: "aros", name: "Aros" },
  { slug: "anillos", name: "Anillos" },
  { slug: "pulseras", name: "Pulseras" },
];

export default async function HomePage() {
  const featured = await prisma.product.findMany({
    where: { active: true, featured: true },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      category: true,
      variants: { orderBy: { priceDelta: "asc" } },
    },
    take: 8,
  });

  const latest = await prisma.product.findMany({
    where: { active: true },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      category: true,
      variants: { orderBy: { priceDelta: "asc" } },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const shown = featured.length > 0 ? featured : latest;
  const s = await getSettings();
  const heroImage = s.heroImage || shown[0]?.images[0]?.url;

  return (
    <>
      {/* Barra de anuncio: envío gratis + apto agua */}
      <div className="bg-sage text-cream px-4 py-2 text-center text-xs sm:text-sm">
        {s.announcement}
        {s.freeShippingCents > 0 && (
          <> · Envío gratis desde {formatARS(s.freeShippingCents)}</>
        )}
      </div>

      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 pt-14 pb-20 lg:grid-cols-2">
          <div>
            <p className="text-gold-dark mb-4 text-xs tracking-[0.2em] uppercase">
              {s.heroKicker}
            </p>
            <h1 className="font-display text-ink text-5xl leading-[1.05] sm:text-6xl">
              {s.heroTitle}
            </h1>
            <p className="text-muted mt-5 max-w-md">{s.heroSubtitle}</p>
            <p className="text-gold-dark mt-3 text-sm font-medium">{s.heroTagline}</p>
            <div className="mt-8 flex gap-3">
              <LinkButton href="/tienda">Ver la tienda</LinkButton>
              <LinkButton href="/tienda?cat=collares" variant="outline">
                Collares
              </LinkButton>
            </div>
          </div>
          <div className="relative">
            <div className="from-rose-soft via-sand to-cream arch flex aspect-[4/5] items-center justify-center overflow-hidden rounded-[2rem] bg-gradient-to-br">
              {heroImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={heroImage}
                  alt={s.heroTitle}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-display text-sage/40 text-3xl">{s.brandName}</span>
              )}
            </div>
            <div className="bg-gold/20 absolute -bottom-4 -left-4 h-24 w-24 rounded-full blur-2xl" />
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/tienda?cat=${c.slug}`}
              className="group border-line hover:border-sage rounded-[var(--radius-card)] border bg-white p-6 text-center transition-colors"
            >
              <div className="bg-rose-soft group-hover:bg-rose mx-auto mb-3 h-14 w-14 rounded-full transition-colors" />
              <p className="text-ink text-sm font-medium">{c.name}</p>
            </Link>
          ))}
        </div>

        {/* Colecciones destacadas */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Link
            href="/tienda?agua=1"
            className="group to-cream flex items-center gap-4 overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-sky-50 p-6 transition-shadow hover:shadow-sm"
          >
            <Droplets className="size-8 text-sky-600" />
            <div>
              <p className="text-ink font-medium">Aptos para agua</p>
              <p className="text-muted text-sm">
                Piezas que no se oxidan ni pierden el brillo
              </p>
            </div>
          </Link>
          <Link
            href="/tienda?regalo=1"
            className="group from-rose-soft to-cream flex items-center gap-4 overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br p-6 transition-shadow hover:shadow-sm"
          >
            <Gift className="text-gold-dark size-8" />
            <div>
              <p className="text-ink font-medium">Ideas para regalar</p>
              <p className="text-muted text-sm">Corazones, tulipanes y más, con cajita</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Destacados */}
      <section className="mx-auto mt-20 max-w-6xl px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-gold-dark text-xs tracking-[0.2em] uppercase">Selección</p>
            <h2 className="font-display text-ink mt-1 text-3xl">Piezas destacadas</h2>
          </div>
          <Link href="/tienda" className="text-sage text-sm hover:underline">
            Ver todo →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {shown.map((p) => {
            const v = p.variants[0];
            return (
              <ProductCard
                key={p.id}
                slug={p.slug}
                name={p.name}
                price={p.basePrice}
                compareAtPrice={p.compareAtPrice}
                waterproof={p.waterproof}
                image={p.images[0]?.url}
                category={p.category?.name}
                featured={p.featured}
                quickAdd={
                  v
                    ? {
                        productId: p.id,
                        variantId: v.id,
                        slug: p.slug,
                        name: p.name,
                        variantName: p.variants.length > 1 ? v.name : "",
                        unitPrice: p.basePrice + v.priceDelta,
                        image: p.images[0]?.url ?? "",
                        multiVariant: p.variants.length > 1,
                      }
                    : undefined
                }
              />
            );
          })}
        </div>
      </section>

      {/* Franja de confianza */}
      <section className="mx-auto mt-20 max-w-6xl px-6">
        <div className="bg-sage text-cream grid gap-6 rounded-[var(--radius-card)] p-10 text-center sm:grid-cols-3">
          <div>
            <p className="font-display text-xl">Envíos a todo el país</p>
            <p className="text-cream/70 mt-1 text-sm">Despacho en 24-48hs</p>
          </div>
          <div>
            <p className="font-display text-xl">Pago seguro</p>
            <p className="text-cream/70 mt-1 text-sm">Con Mercado Pago</p>
          </div>
          <div>
            <p className="font-display text-xl">Acero quirúrgico</p>
            <p className="text-cream/70 mt-1 text-sm">No se oxida ni mancha la piel</p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
