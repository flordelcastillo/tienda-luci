// Paginación de la tienda. Lógica pura (sin Prisma ni Next) para poder testearla.

export const PAGE_SIZE = 8;

export type Pagination = {
  page: number; // página actual (1-based, ya acotada a [1, totalPages])
  totalPages: number; // siempre >= 1
  totalItems: number;
  pageSize: number;
  skip: number; // para prisma.findMany
  take: number;
  hasPrev: boolean;
  hasNext: boolean;
};

// Convierte el parámetro `page` de la URL a un entero >= 1 (default 1).
// Valores inválidos, vacíos o < 1 caen en 1.
export function parsePage(raw?: string): number {
  const n = Number.parseInt((raw ?? "").trim(), 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

// Calcula la paginación acotando la página pedida al rango válido.
export function buildPagination(
  totalItems: number,
  requestedPage: number,
  pageSize: number = PAGE_SIZE,
): Pagination {
  const total = Math.max(0, Math.floor(totalItems));
  const size = Math.max(1, Math.floor(pageSize));
  const totalPages = Math.max(1, Math.ceil(total / size));
  const page = Math.min(Math.max(1, Math.floor(requestedPage)), totalPages);

  return {
    page,
    totalPages,
    totalItems: total,
    pageSize: size,
    skip: (page - 1) * size,
    take: size,
    hasPrev: page > 1,
    hasNext: page < totalPages,
  };
}
