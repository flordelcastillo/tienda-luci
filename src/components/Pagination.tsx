import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildStoreQuery, type StoreParams } from "@/lib/store-filter";

// Controles de paginación de la tienda. Cada enlace preserva los filtros/orden
// actuales (via buildStoreQuery) y solo cambia el número de página.
export function Pagination({
  params,
  page,
  totalPages,
}: {
  params: StoreParams;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const linkTo = (n: number) => buildStoreQuery(params, { page: String(n) });

  const arrow =
    "border-line text-ink hover:bg-sand/50 inline-flex h-10 w-10 items-center justify-center rounded-md border bg-white transition-colors";
  const disabled = "pointer-events-none opacity-40";

  return (
    <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Paginación">
      <Link
        href={linkTo(page - 1)}
        aria-label="Página anterior"
        aria-disabled={page <= 1}
        className={`${arrow} ${page <= 1 ? disabled : ""}`}
      >
        <ChevronLeft className="size-4" />
      </Link>

      {pages.map((n) => (
        <Link
          key={n}
          href={linkTo(n)}
          aria-label={`Página ${n}`}
          aria-current={n === page ? "page" : undefined}
          className={`inline-flex h-10 min-w-10 items-center justify-center rounded-md border px-3 text-sm transition-colors ${
            n === page
              ? "bg-sage text-cream border-sage"
              : "border-line text-ink hover:bg-sand/50 bg-white"
          }`}
        >
          {n}
        </Link>
      ))}

      <Link
        href={linkTo(page + 1)}
        aria-label="Página siguiente"
        aria-disabled={page >= totalPages}
        className={`${arrow} ${page >= totalPages ? disabled : ""}`}
      >
        <ChevronRight className="size-4" />
      </Link>
    </nav>
  );
}
