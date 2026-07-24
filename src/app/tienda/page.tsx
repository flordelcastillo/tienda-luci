import Link from "next/link";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SiteHeader, SiteFooter } from "@/components/storefront";
import { ProductCard } from "@/components/ProductCard";
import { Button, Input } from "@/components/ui";
import {
  buildStoreWhere,
  buildStoreQuery,
  buildStoreOrderBy,
  AUDIENCE_OPTIONS,
  DEFAULT_SORT,
  type StoreParams,
} from "@/lib/store-filter";
import { METAL_OPTIONS, STONE_COLOR_OPTIONS } from "@/lib/product-attributes";
import { parsePage, buildPagination } from "@/lib/pagination";
import { SortSelect } from "@/components/SortSelect";
import { Pagination } from "@/components/Pagination";

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
  searchParams: Promise<StoreParams>;
}) {
  const params = await searchParams;
  const {
    cat = "",
    q = "",
    min = "",
    max = "",
    aud = "",
    metal = "",
    color = "",
    agua = "",
    regalo = "",
    sort = DEFAULT_SORT,
  } = params;

  const where = buildStoreWhere(params);
  const total = await prisma.product.count({ where });
  const pagination = buildPagination(total, parsePage(params.page));

  const products = await prisma.product.findMany({
    where,
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      category: true,
      variants: { orderBy: { priceDelta: "asc" } },
    },
    orderBy: buildStoreOrderBy(sort),
    skip: pagination.skip,
    take: pagination.take,
  });

  const hasFilters = Boolean(
    q ||
    min ||
    max ||
    cat ||
    aud ||
    metal ||
    color ||
    agua ||
    regalo ||
    (sort && sort !== DEFAULT_SORT),
  );

  // Filtros avanzados activos (los que van dentro del panel "Filtros").
  const advancedCount = [aud, metal, color, agua === "1", regalo === "1"].filter(
    Boolean,
  ).length;

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="font-display text-ink text-4xl">Tienda</h1>
        <p className="text-muted mt-1">{total} piezas disponibles</p>

        {/* Categorías: preservan la búsqueda y el rango de precio actuales */}
        <div className="mt-6 flex flex-wrap gap-2">
          {CATS.map((c) => (
            <Link
              key={c.slug}
              href={buildStoreQuery(params, { cat: c.slug })}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                cat === c.slug
                  ? "bg-sage text-cream"
                  : "border-line text-ink hover:bg-sand/50 border bg-white"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {/* Filtros avanzados unificados en un panel desplegable */}
        <details className="group mt-3">
          <summary className="border-line text-ink hover:bg-sand/50 inline-flex cursor-pointer list-none items-center gap-2 rounded-full border bg-white px-4 py-1.5 text-sm select-none">
            <SlidersHorizontal className="size-4" />
            Filtros
            {advancedCount > 0 && (
              <span className="bg-sage text-cream ml-0.5 rounded-full px-1.5 text-xs">
                {advancedCount}
              </span>
            )}
            <span className="text-muted ml-1 text-xs group-open:hidden">▾</span>
            <span className="text-muted ml-1 hidden text-xs group-open:inline">▴</span>
          </summary>

          <div className="border-line mt-3 space-y-4 rounded-[var(--radius-card)] border bg-white p-5">
            {/* Destinatario: mujer / hombre / niños (las piezas unisex salen en todos) */}
            <FilterRow label="Para">
              {AUDIENCE_OPTIONS.map((a) => (
                <Pill
                  key={a.value}
                  href={buildStoreQuery(params, { aud: a.value })}
                  active={aud === a.value}
                  tone="gold"
                >
                  {a.label}
                </Pill>
              ))}
            </FilterRow>

            <FilterRow label="Metal">
              {[{ value: "", label: "Todos" }, ...METAL_OPTIONS].map((m) => (
                <Pill
                  key={m.value}
                  href={buildStoreQuery(params, { metal: m.value })}
                  active={metal === m.value}
                >
                  {m.label}
                </Pill>
              ))}
            </FilterRow>

            <FilterRow label="Color">
              {[{ value: "", label: "Todos" }, ...STONE_COLOR_OPTIONS].map((c) => (
                <Pill
                  key={c.value}
                  href={buildStoreQuery(params, { color: c.value })}
                  active={color === c.value}
                >
                  {c.label}
                </Pill>
              ))}
            </FilterRow>

            <FilterRow label="Extras">
              <Pill
                href={buildStoreQuery(params, { agua: agua === "1" ? "" : "1" })}
                active={agua === "1"}
              >
                💧 Aptos para agua
              </Pill>
              <Pill
                href={buildStoreQuery(params, { regalo: regalo === "1" ? "" : "1" })}
                active={regalo === "1"}
                tone="gold"
              >
                🎁 Ideas para regalar
              </Pill>
            </FilterRow>
          </div>
        </details>

        {/* Búsqueda por nombre + rango de precio (GET, preserva la categoría) */}
        <form
          method="get"
          className="mt-4 flex flex-wrap items-center gap-2"
          role="search"
        >
          {cat && <input type="hidden" name="cat" value={cat} />}
          {aud && <input type="hidden" name="aud" value={aud} />}
          {metal && <input type="hidden" name="metal" value={metal} />}
          {color && <input type="hidden" name="color" value={color} />}
          {agua === "1" && <input type="hidden" name="agua" value="1" />}
          {regalo === "1" && <input type="hidden" name="regalo" value="1" />}
          <div className="relative min-w-56 flex-1">
            <Search className="text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Buscar por nombre…"
              aria-label="Buscar productos"
              className="pl-9"
            />
          </div>
          <Input
            type="number"
            name="min"
            defaultValue={min}
            placeholder="$ mín"
            aria-label="Precio mínimo"
            min={0}
            className="w-28"
          />
          <Input
            type="number"
            name="max"
            defaultValue={max}
            placeholder="$ máx"
            aria-label="Precio máximo"
            min={0}
            className="w-28"
          />
          <SortSelect value={sort} />
          <Button type="submit">Filtrar</Button>
          {hasFilters && (
            <Link
              href="/tienda"
              className="text-muted hover:text-ink inline-flex items-center gap-1 text-sm"
            >
              <X className="size-4" />
              Limpiar
            </Link>
          )}
        </form>

        <div className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
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

        {products.length === 0 && (
          <p className="text-muted py-16 text-center">
            No se encontraron piezas con esos filtros.
          </p>
        )}

        <Pagination
          params={params}
          page={pagination.page}
          totalPages={pagination.totalPages}
        />
      </div>
      <SiteFooter />
    </>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-muted w-14 shrink-0 text-xs tracking-wide uppercase">
        {label}
      </span>
      {children}
    </div>
  );
}

function Pill({
  href,
  active,
  tone = "sage",
  children,
}: {
  href: string;
  active: boolean;
  tone?: "sage" | "gold";
  children: React.ReactNode;
}) {
  const activeClass = tone === "gold" ? "bg-gold text-ink" : "bg-sage text-cream";
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1 text-sm transition-colors ${
        active ? activeClass : "border-line text-muted hover:bg-sand/50 border bg-white"
      }`}
    >
      {children}
    </Link>
  );
}
