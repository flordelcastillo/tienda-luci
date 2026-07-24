"use client";

import { SORT_OPTIONS } from "@/lib/store-filter";

// Select de ordenamiento que auto-envía el formulario que lo contiene al cambiar.
// Vive dentro del <form> GET de la tienda, así arrastra los filtros actuales.
export function SortSelect({ value }: { value: string }) {
  return (
    <select
      name="sort"
      defaultValue={value}
      aria-label="Ordenar por"
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
      className="border-line text-ink focus-visible:ring-sage h-10 rounded-md border bg-white px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
    >
      {SORT_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
