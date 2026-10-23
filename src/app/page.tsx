import Image from "next/image";
import Link from "next/link";
import { Droplets, Gift } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SiteHeader, SiteFooter } from "@/components/storefront";
import { ProductCard } from "@/components/ProductCard";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  { slug: "collares", name: "Collares" },
  { slug: "aros", name: "Aros" },
  { slug: "anillos", name: "Anillos" },
  { slug: "pulseras", name: "Pulseras" },
];

const productInclude = {
  images: { orderBy: { position: "asc" as const }, take: 1 },
  category: true,
  variants: { orderBy: { priceDelta: "asc" as const } },
};

type HomeProduct = Awaited<ReturnType<typeof getLatest>>[number];

const getLatest = () =>
  prisma.product.findMany({
    where: { active: true },
    include: productInclude,
    orderBy: { createdAt: "desc" },
    take: 8,
  });

function Grid({ products }: { products: HomeProduct[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
      {products.map((p) => {
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
  );
}

export default async function HomePage() {
  const [latest, featured, s, categoryImages] = await Promise.all([
    getLatest(),
    prisma.product.findMany({
      where: { active: true, featured: true },
      include: productInclude,
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
    getSettings(),
    // Foto representativa de cada categoría: la del producto más nuevo.
    Promise.all(
      CATEGORIES.map((c) =>
        prisma.product.findFirst({
          where: { active: true, category: { slug: c.slug } },
          orderBy: { createdAt: "desc" },
          select: { images: { orderBy: { position: "asc" }, take: 1 } },
        }),
      ),
    ),
  ]);

  // "Destacados" sólo si aporta productos que no estén ya en Novedades.
  const latestIds = new Set(latest.map((p) => p.id));
  const extraFeatured = featured.filter((p) => !latestIds.has(p.id));
  const heroImage = s.heroImage;

  return (
    <>
      <SiteHeader />

      {/* Banner: foto de portada (Ajustes) o fondo rosa con el logo */}
      <section className="mx-auto w-full max-w-6xl px-6 pt-6">
        <div className="from-rose-soft to-rose relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br sm:aspect-[21/9]">
          {heroImage ? (
            <>
              <Image
                src={heroImage}
                alt={s.heroTitle}
                fill
                priority
                unoptimized
                sizes="(max-width:1152px) 100vw, 1152px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent" />
            </>
          ) : (
            <Image
              src="/logo-teia.png"
              alt=""
              width={407}
              height={213}
              priority
              className="absolute top-1/2 right-4 hidden h-[75%] w-auto -translate-y-1/2 opacity-90 sm:block"
            />
          )}
          <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12">
            <p
              className={`text-xs tracking-[0.2em] uppercase ${heroImage ? "text-white/80" : "text-muted"}`}
            >
              {s.heroKicker}
            </p>
            <h1
              className={`font-display mt-2 max-w-md text-3xl leading-tight sm:text-5xl ${heroImage ? "text-white" : "text-ink"}`}
            >
              {s.heroTitle}
            </h1>
            <p
              className={`mt-3 hidden max-w-sm text-sm sm:block ${heroImage ? "text-white/85" : "text-muted"}`}
            >
              {s.heroTagline}
            </p>
            <Link
              href="/tienda"
              className={`mt-5 w-fit rounded-full px-6 py-2.5 text-sm transition-opacity hover:opacity-90 ${heroImage ? "text-ink bg-white" : "bg-sage text-cream"}`}
            >
              Ver la tienda
            </Link>
          </div>
        </div>
      </section>

      {/* Categorías con foto */}
      <section className="mx-auto w-full max-w-6xl px-6 pt-6">
        <div className="flex flex-wrap justify-center gap-3">
          {CATEGORIES.map((c, i) => ({ ...c, img: categoryImages[i]?.images[0]?.url }))
            .filter((c) => c.img)
            .map((c) => {
              const img = c.img;
              return (
                <Link
                  key={c.slug}
                  href={`/tienda?cat=${c.slug}`}
                  className="group bg-rose-soft relative aspect-[4/5] w-[calc(50%-6px)] overflow-hidden rounded-xl sm:w-[calc(25%-9px)]"
                >
                  {img && (
                    <Image
                      src={img}
                      alt={c.name}
                      fill
                      unoptimized
                      sizes="(max-width:640px) 50vw, 280px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                  <p className="absolute bottom-3 left-3 text-sm font-medium tracking-wide text-white uppercase">
                    {c.name}
                  </p>
                </Link>
              );
            })}
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Link
            href="/tienda?agua=1"
            className="border-line hover:border-sage flex items-center gap-4 rounded-xl border p-5 transition-colors"
          >
            <Droplets className="size-7 text-sky-600" />
            <div>
              <p className="text-ink text-sm font-medium">Aptos para agua</p>
              <p className="text-muted text-sm">
                Piezas que no se oxidan ni pierden el brillo
              </p>
            </div>
          </Link>
          <Link
            href="/tienda?regalo=1"
            className="border-line hover:border-sage flex items-center gap-4 rounded-xl border p-5 transition-colors"
          >
            <Gift className="text-gold-dark size-7" />
            <div>
              <p className="text-ink text-sm font-medium">Ideas para regalar</p>
              <p className="text-muted text-sm">Corazones, tulipanes y más, con cajita</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Novedades */}
      <section className="mx-auto mt-16 w-full max-w-6xl px-6">
        <h2 className="mb-6 text-center font-sans! text-3xl">Novedades</h2>
        <Grid products={latest} />
        <div className="mt-10 text-center">
          <Link
            href="/tienda"
            className="border-ink text-ink hover:bg-ink inline-block rounded-full border px-7 py-2.5 text-sm transition-colors hover:text-white"
          >
            Ver toda la tienda
          </Link>
        </div>
      </section>

      {extraFeatured.length > 0 && (
        <section className="mx-auto mt-16 w-full max-w-6xl px-6">
          <h2 className="mb-6 text-center font-sans! text-3xl">Productos destacados</h2>
          <Grid products={extraFeatured} />
        </section>
      )}

      {/* Franja de confianza */}
      <section className="mx-auto mt-16 w-full max-w-6xl px-6">
        <div className="bg-sand text-ink grid gap-6 rounded-xl p-8 text-center sm:grid-cols-3">
          <div>
            <p className="font-medium">Envíos a todo el país</p>
            <p className="text-muted mt-1 text-sm">Despacho en 24-48hs</p>
          </div>
          <div>
            <p className="font-medium">Pago por transferencia</p>
            <p className="text-muted mt-1 text-sm">Te pasamos los datos por WhatsApp</p>
          </div>
          <div>
            <p className="font-medium">Acero quirúrgico</p>
            <p className="text-muted mt-1 text-sm">No se oxida ni mancha la piel</p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
