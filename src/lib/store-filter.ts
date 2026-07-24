import type { Prisma } from "@/generated/prisma/client";
import { pesosToCents } from "./money";

// Parámetros de búsqueda/filtro que acepta la tienda (todos opcionales, vienen de la URL).
export type StoreParams = {
  cat?: string;
  q?: string;
  min?: string; // en pesos (texto del input)
  max?: string; // en pesos
};

// Construye el `where` de Prisma para listar productos activos según los filtros.
// Precios se guardan en centavos → convertimos el rango ingresado en pesos.
export function buildStoreWhere(params: StoreParams): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { active: true };

  if (params.cat?.trim()) where.category = { slug: params.cat.trim() };

  const q = params.q?.trim();
  if (q) where.name = { contains: q, mode: "insensitive" };

  const price: Prisma.IntFilter = {};
  if (params.min?.trim()) price.gte = pesosToCents(params.min);
  if (params.max?.trim()) price.lte = pesosToCents(params.max);
  if (price.gte !== undefined || price.lte !== undefined) where.basePrice = price;

  return where;
}

// Arma un querystring para la tienda preservando los filtros actuales y aplicando overrides.
// Las claves vacías o nulas se omiten (URLs limpias, sin ?cat=&q=).
export function buildStoreQuery(
  current: StoreParams,
  overrides: Partial<StoreParams> = {},
): string {
  const merged = { ...current, ...overrides };
  const sp = new URLSearchParams();
  for (const key of ["cat", "q", "min", "max"] as const) {
    const value = merged[key]?.trim();
    if (value) sp.set(key, value);
  }
  const qs = sp.toString();
  return qs ? `/tienda?${qs}` : "/tienda";
}
