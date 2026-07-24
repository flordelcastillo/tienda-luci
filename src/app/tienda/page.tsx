import Link from "next/link";
import { Search, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SiteHeader, SiteFooter } from "@/components/storefront";
import { ProductCard } from "@/components/ProductCard";
import { Button, Input } from "@/components/ui";
import {
  buildStoreWhere,
  buildStoreQuery,
  buildStoreOrderBy,
  DEFAULT_SORT,
  type StoreParams,
} from "@/lib/store-filter";
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
  const { cat = "", q = "", min = "", max = "", sort = DEFAULT_SORT } = params;

  const where = buildStoreWhere(params);
  const total = await prisma.product.count({ where });
  const pagination = buildPagination(total, parsePage(params.page));

  const products = await prisma.product.findMany({
    where,
    include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true },
    orderBy: buildStoreOrderBy(sort),
    skip: pagination.skip,
    take: pagination.take,
  });

  const hasFilters = Boolean(q || min || max || cat || (sort && sort !== DEFAULT_SORT));

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

        {/* Búsqueda por nombre + rango de precio (GET, preserva la categoría) */}
        <form
          method="get"
          className="mt-4 flex flex-wrap items-center gap-2"
          role="search"
        >
          {cat && <input type="hidden" name="cat" value={cat} />}
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
