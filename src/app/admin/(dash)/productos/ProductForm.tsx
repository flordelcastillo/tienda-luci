"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button, Card, Field, Input, Textarea, Select } from "@/components/ui";
import { centsToPesos } from "@/lib/money";
import {
  METAL_OPTIONS,
  STONE_COLOR_OPTIONS,
  THEME_OPTIONS,
  type Option,
} from "@/lib/product-attributes";

type Category = { id: string; name: string };
type ImageItem = { url: string; alt: string };
type Variant = {
  id?: string;
  name: string;
  sku: string;
  priceDelta: string; // en pesos, string editable
  stock: string;
};

export type ProductInitial = {
  id?: string;
  name: string;
  description: string;
  material: string;
  gemstone: string;
  basePrice: string; // en pesos
  compareAtPrice: string; // en pesos, precio ancla tachado ("" = sin descuento)
  categoryId: string;
  active: boolean;
  featured: boolean;
  // Atributos de marketing / filtrado
  metal: string;
  stoneColor: string;
  theme: string;
  waterproof: boolean;
  hypoallergenic: boolean;
  giftIdea: boolean;
  giftWrap: boolean;
  measurements: string;
  audience: string;
  images: ImageItem[];
  variants: Variant[];
};

const empty: ProductInitial = {
  name: "",
  description: "",
  material: "",
  gemstone: "",
  basePrice: "",
  compareAtPrice: "",
  categoryId: "",
  active: true,
  featured: false,
  metal: "",
  stoneColor: "",
  theme: "",
  waterproof: true,
  hypoallergenic: true,
  giftIdea: false,
  giftWrap: false,
  measurements: "",
  audience: "mujer",
  images: [],
  variants: [{ name: "Único", sku: "", priceDelta: "0", stock: "0" }],
};

export function ProductForm({
  categories,
  initial,
  action,
}: {
  categories: Category[];
  initial?: ProductInitial;
  action: (formData: FormData) => Promise<{ error?: string } | void>;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProductInitial>(initial ?? empty);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, start] = useTransition();

  function set<K extends keyof ProductInitial>(key: K, value: ProductInitial[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded: ImageItem[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Error al subir");
        uploaded.push({ url: json.url, alt: "" });
      }
      set("images", [...form.images, ...uploaded]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al subir imagen");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(idx: number) {
    set(
      "images",
      form.images.filter((_, i) => i !== idx),
    );
  }

  function addVariant() {
    set("variants", [
      ...form.variants,
      { name: "", sku: "", priceDelta: "0", stock: "0" },
    ]);
  }
  function updateVariant(idx: number, patch: Partial<Variant>) {
    set(
      "variants",
      form.variants.map((v, i) => (i === idx ? { ...v, ...patch } : v)),
    );
  }
  function removeVariant(idx: number) {
    if (form.variants.length === 1) return;
    set(
      "variants",
      form.variants.filter((_, i) => i !== idx),
    );
  }

  function submit() {
    setError(null);
    if (!form.name.trim()) return setError("El nombre es obligatorio");
    if (!form.basePrice.trim()) return setError("El precio es obligatorio");
    if (form.images.length === 0) return setError("Subí al menos una imagen");
    if (form.variants.some((v) => !v.name.trim() || !v.sku.trim()))
      return setError("Cada variante necesita nombre y SKU");

    const payload = {
      name: form.name,
      description: form.description,
      material: form.material,
      gemstone: form.gemstone,
      basePrice: form.basePrice,
      compareAtPrice: form.compareAtPrice,
      categoryId: form.categoryId || null,
      active: form.active,
      featured: form.featured,
      metal: form.metal,
      stoneColor: form.stoneColor,
      theme: form.theme,
      waterproof: form.waterproof,
      hypoallergenic: form.hypoallergenic,
      giftIdea: form.giftIdea,
      giftWrap: form.giftWrap,
      measurements: form.measurements,
      audience: form.audience,
      images: form.images,
      variants: form.variants,
    };

    const fd = new FormData();
    fd.append("payload", JSON.stringify(payload));

    start(async () => {
      const res = await action(fd);
      if (res && "error" in res && res.error) setError(res.error);
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        {/* Columna principal */}
        <div className="space-y-6">
          <Card className="space-y-4 p-6">
            <h2 className="font-display text-ink text-xl">Datos de la pieza</h2>
            <Field label="Nombre">
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Anillo Solitario Aurora"
              />
            </Field>
            <Field label="Descripción">
              <Textarea
                rows={4}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Detalles, materiales, cuidados…"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Material">
                <Input
                  value={form.material}
                  onChange={(e) => set("material", e.target.value)}
                  placeholder="Plata 925"
                />
              </Field>
              <Field label="Piedra (opcional)">
                <Input
                  value={form.gemstone}
                  onChange={(e) => set("gemstone", e.target.value)}
                  placeholder="Circonita"
                />
              </Field>
            </div>
          </Card>

          {/* Atributos y filtros */}
          <Card className="space-y-4 p-6">
            <h2 className="font-display text-ink text-xl">Atributos y filtros</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <AttributeSelect
                label="Metal"
                value={form.metal}
                options={METAL_OPTIONS}
                onChange={(v) => set("metal", v)}
              />
              <AttributeSelect
                label="Color de piedra"
                value={form.stoneColor}
                options={STONE_COLOR_OPTIONS}
                onChange={(v) => set("stoneColor", v)}
              />
              <AttributeSelect
                label="Tema (para combos)"
                value={form.theme}
                options={THEME_OPTIONS}
                onChange={(v) => set("theme", v)}
              />
              <Field label="Destinatario">
                <Select
                  value={form.audience}
                  onChange={(e) => set("audience", e.target.value)}
                >
                  <option value="mujer">Mujer</option>
                  <option value="hombre">Hombre</option>
                  <option value="ninos">Niños</option>
                  <option value="unisex">Unisex</option>
                </Select>
              </Field>
            </div>
            <Field label="Medidas" hint="Ej: Dije 1.2 cm · cadena 45 cm">
              <Input
                value={form.measurements}
                onChange={(e) => set("measurements", e.target.value)}
                placeholder="Dije 1.2 cm · cadena 45 cm"
              />
            </Field>
            <div className="grid gap-2 sm:grid-cols-2">
              {(
                [
                  { key: "waterproof", label: "Apto agua / no se oxida" },
                  { key: "hypoallergenic", label: "Hipoalergénico" },
                  { key: "giftIdea", label: "Idea para regalar" },
                  { key: "giftWrap", label: "Cajita de regalo disponible" },
                ] as const
              ).map((c) => (
                <label key={c.key} className="text-ink flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={form[c.key]}
                    onChange={(e) => set(c.key, e.target.checked)}
                    className="h-4 w-4 accent-[var(--sage)]"
                  />
                  {c.label}
                </label>
              ))}
            </div>
          </Card>

          {/* Imágenes */}
          <Card className="space-y-4 p-6">
            <h2 className="font-display text-ink text-xl">Imágenes</h2>
            <div className="flex flex-wrap gap-3">
              {form.images.map((img, i) => (
                <div key={i} className="group relative">
                  <div className="border-line bg-sand h-24 w-24 overflow-hidden rounded-xl border">
                    <Image
                      src={img.url}
                      alt={img.alt || "imagen"}
                      width={96}
                      height={96}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-600 text-xs text-white opacity-0 transition group-hover:opacity-100"
                  >
                    ✕
                  </button>
                  {i === 0 && (
                    <span className="bg-sage text-cream absolute bottom-1 left-1 rounded-full px-1.5 text-[10px]">
                      portada
                    </span>
                  )}
                </div>
              ))}
              <label className="border-line hover:border-sage text-muted hover:text-sage flex h-24 w-24 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed transition">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => onUpload(e.target.files)}
                />
                <span className="px-2 text-center text-sm">
                  {uploading ? "Subiendo…" : "+ Agregar"}
                </span>
              </label>
            </div>
            <p className="text-muted text-xs">
              JPG, PNG o WEBP hasta 5 MB. La primera imagen es la portada.
            </p>
          </Card>

          {/* Variantes */}
          <Card className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-ink text-xl">Variantes y stock</h2>
              <Button type="button" variant="outline" onClick={addVariant}>
                + Variante
              </Button>
            </div>
            <div className="space-y-3">
              <div className="text-muted hidden grid-cols-[1fr_1fr_120px_90px_40px] gap-2 px-1 text-xs tracking-wide uppercase sm:grid">
                <span>Nombre</span>
                <span>SKU</span>
                <span>+/- precio</span>
                <span>Stock</span>
                <span />
              </div>
              {form.variants.map((v, i) => (
                <div
                  key={i}
                  className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_120px_90px_40px]"
                >
                  <Input
                    placeholder="Talle 16"
                    value={v.name}
                    onChange={(e) => updateVariant(i, { name: e.target.value })}
                  />
                  <Input
                    placeholder="SKU-001"
                    value={v.sku}
                    onChange={(e) => updateVariant(i, { sku: e.target.value })}
                  />
                  <Input
                    placeholder="0"
                    value={v.priceDelta}
                    onChange={(e) => updateVariant(i, { priceDelta: e.target.value })}
                  />
                  <Input
                    placeholder="0"
                    value={v.stock}
                    onChange={(e) =>
                      updateVariant(i, { stock: e.target.value.replace(/[^0-9]/g, "") })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => removeVariant(i)}
                    disabled={form.variants.length === 1}
                    className="text-muted hover:text-red-600 disabled:opacity-30"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <p className="text-muted text-xs">
              “+/- precio” ajusta sobre el precio base (ej: 5000 suma $5.000 a esa
              variante).
            </p>
          </Card>
        </div>

        {/* Columna lateral */}
        <div className="space-y-6 lg:sticky lg:top-8">
          <Card className="space-y-4 p-6">
            <Field label="Precio base (ARS)" hint="Precio en pesos, ej: 45000">
              <Input
                value={form.basePrice}
                onChange={(e) => set("basePrice", e.target.value)}
                placeholder="45000"
              />
            </Field>
            <Field
              label="Precio ancla (opcional)"
              hint="Precio anterior tachado. Dejalo vacío si no hay descuento."
            >
              <Input
                value={form.compareAtPrice}
                onChange={(e) => set("compareAtPrice", e.target.value)}
                placeholder="60000"
              />
            </Field>
            <Field label="Categoría">
              <Select
                value={form.categoryId}
                onChange={(e) => set("categoryId", e.target.value)}
              >
                <option value="">Sin categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <label className="text-ink flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => set("active", e.target.checked)}
                className="h-4 w-4 accent-[var(--sage)]"
              />
              Activo (visible en la tienda)
            </label>
            <label className="text-ink flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set("featured", e.target.checked)}
                className="h-4 w-4 accent-[var(--gold)]"
              />
              Destacado en la home
            </label>
          </Card>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={submit} disabled={pending || uploading} className="flex-1">
              {pending
                ? "Guardando…"
                : initial?.id
                  ? "Guardar cambios"
                  : "Crear producto"}
            </Button>
            <Button
              variant="ghost"
              type="button"
              onClick={() => router.push("/admin/productos")}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { centsToPesos };

// Selector de atributo con opción "Otro (a definir)": si el valor guardado no
// está entre las opciones conocidas, se edita como texto libre.
const OTHER = "__otro__";

function AttributeSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}) {
  const known = options.some((o) => o.value === value);
  const [forceOther, setForceOther] = useState(value !== "" && !known);
  const isOther = forceOther || (value !== "" && !known);

  return (
    <Field label={label} hint={isOther ? "Valor personalizado" : undefined}>
      <Select
        value={isOther ? OTHER : value}
        onChange={(e) => {
          const v = e.target.value;
          if (v === OTHER) {
            setForceOther(true);
            onChange("");
          } else {
            setForceOther(false);
            onChange(v);
          }
        }}
      >
        <option value="">—</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
        <option value={OTHER}>Otro (a definir)…</option>
      </Select>
      {isOther && (
        <Input
          className="mt-2"
          value={value}
          placeholder="Escribí el valor"
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </Field>
  );
}
