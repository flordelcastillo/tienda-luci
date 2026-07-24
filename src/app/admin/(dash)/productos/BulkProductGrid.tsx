"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, Badge, Select, Button } from "@/components/ui";
import { formatARS } from "@/lib/money";
import {
  METAL_OPTIONS,
  STONE_COLOR_OPTIONS,
  THEME_OPTIONS,
} from "@/lib/product-attributes";
import { bulkUpdateProducts } from "./actions";

export type AdminProduct = {
  id: string;
  name: string;
  category: string | null;
  image: string | null;
  basePrice: number;
  stock: number;
  featured: boolean;
  active: boolean;
};

// Definición de los campos aplicables en lote y su control de valor.
type FieldDef =
  | {
      field: string;
      label: string;
      type: "select";
      options: { value: string; label: string }[];
    }
  | { field: string; label: string; type: "bool" };

const BULK_FIELDS: FieldDef[] = [
  { field: "metal", label: "Metal", type: "select", options: METAL_OPTIONS },
  {
    field: "stoneColor",
    label: "Color de piedra",
    type: "select",
    options: STONE_COLOR_OPTIONS,
  },
  { field: "theme", label: "Tema", type: "select", options: THEME_OPTIONS },
  {
    field: "audience",
    label: "Destinatario",
    type: "select",
    options: [
      { value: "mujer", label: "Mujer" },
      { value: "hombre", label: "Hombre" },
      { value: "ninos", label: "Niños" },
      { value: "unisex", label: "Unisex" },
    ],
  },
  { field: "waterproof", label: "Apto agua", type: "bool" },
  { field: "giftIdea", label: "Idea para regalar", type: "bool" },
  { field: "giftWrap", label: "Cajita de regalo", type: "bool" },
  { field: "featured", label: "Destacado", type: "bool" },
  { field: "active", label: "Activo", type: "bool" },
];

export function BulkProductGrid({ products }: { products: AdminProduct[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [fieldKey, setFieldKey] = useState(BULK_FIELDS[0].field);
  const [value, setValue] = useState("");
  const [pending, start] = useTransition();

  const def = BULK_FIELDS.find((f) => f.field === fieldKey)!;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(products.map((p) => p.id)));
  }

  function apply() {
    const ids = [...selected];
    if (ids.length === 0) return;
    const parsedValue = def.type === "bool" ? value === "true" : value;

    start(async () => {
      const res = await bulkUpdateProducts({ ids, field: fieldKey, value: parsedValue });
      if (res && "error" in res && res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`Actualizados ${res?.count ?? ids.length} productos`);
      setSelected(new Set());
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {/* Barra de acción en lote */}
      {selected.size > 0 && (
        <div className="border-line sticky top-4 z-20 flex flex-wrap items-center gap-3 rounded-[var(--radius-card)] border bg-white p-4 shadow-sm">
          <span className="text-ink text-sm font-medium">
            {selected.size} seleccionado{selected.size > 1 ? "s" : ""}
          </span>
          <Select
            value={fieldKey}
            onChange={(e) => {
              setFieldKey(e.target.value);
              setValue("");
            }}
            className="w-44"
          >
            {BULK_FIELDS.map((f) => (
              <option key={f.field} value={f.field}>
                {f.label}
              </option>
            ))}
          </Select>
          <Select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-44"
          >
            <option value="">Elegí un valor…</option>
            {def.type === "bool" ? (
              <>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </>
            ) : (
              def.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))
            )}
          </Select>
          <Button onClick={apply} disabled={pending || value === ""}>
            {pending ? "Aplicando…" : "Aplicar"}
          </Button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="text-muted hover:text-ink text-sm"
          >
            Limpiar selección
          </button>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={selectAll}
          className="text-muted hover:text-sage text-sm"
        >
          Seleccionar todos
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => {
          const isSel = selected.has(p.id);
          return (
            <Card
              key={p.id}
              className={`overflow-hidden transition-shadow ${
                isSel
                  ? "ring-sage ring-2"
                  : "hover:shadow-[0_8px_30px_-10px_rgba(59,74,63,0.25)]"
              }`}
            >
              <div className="bg-sand relative aspect-square">
                {p.image && (
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    className="object-cover"
                    unoptimized
                    sizes="300px"
                  />
                )}
                {/* Checkbox de selección */}
                <label className="absolute top-3 right-3 z-10 flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={isSel}
                    onChange={() => toggle(p.id)}
                    className="h-5 w-5 accent-[var(--sage)]"
                    aria-label={`Seleccionar ${p.name}`}
                  />
                </label>
                <div className="absolute top-3 left-3 flex gap-1.5">
                  {p.featured && <Badge tone="gold">Destacado</Badge>}
                  {!p.active && <Badge tone="gray">Oculto</Badge>}
                </div>
              </div>
              <Link href={`/admin/productos/${p.id}`} className="block p-4">
                <p className="text-muted text-xs">{p.category ?? "Sin categoría"}</p>
                <p className="text-ink mt-0.5 truncate font-medium">{p.name}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-display text-sage text-lg">
                    {formatARS(p.basePrice)}
                  </span>
                  <Badge tone={p.stock === 0 ? "red" : p.stock <= 3 ? "gold" : "sage"}>
                    {p.stock} en stock
                  </Badge>
                </div>
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
