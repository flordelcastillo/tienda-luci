import type { Prisma } from "@/generated/prisma/client";
import { pesosToCents } from "./money";

// Parámetros de búsqueda/filtro que acepta la tienda (todos opcionales, vienen de la URL).
export type StoreParams = {
  cat?: string;
  q?: string;
  min?: string; // en pesos (texto del input)
  max?: string; // en pesos
  sort?: string; // clave de ordenamiento (ver SORT_OPTIONS)
};

// Opciones de ordenamiento visibles en la tienda. El primero es el default.
export const SORT_OPTIONS = [
  { value: "nuevos", label: "Más nuevos" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "nombre", label: "Nombre (A-Z)" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export const DEFAULT_SORT: SortValue = "nuevos";

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

// Traduce la clave de ordenamiento (de la URL) al `orderBy` de Prisma.
// Cualquier valor desconocido o vacío cae en el orden por defecto (más nuevos).
export function buildStoreOrderBy(
  sort?: string,
): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "precio-asc":
      return { basePrice: "asc" };
    case "precio-desc":
      return { basePrice: "desc" };
    case "nombre":
      return { name: "asc" };
    default:
      return { createdAt: "desc" };
  }
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
  // El orden por defecto no se agrega a la URL para mantenerla limpia.
  const sort = merged.sort?.trim();
  if (sort && sort !== DEFAULT_SORT) sp.set("sort", sort);
  const qs = sp.toString();
  return qs ? `/tienda?${qs}` : "/tienda";
}
