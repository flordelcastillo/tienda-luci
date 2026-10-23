"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, Card, Field, Input } from "@/components/ui";
import { createCategory, updateCategory } from "./actions";

type Row = {
  id: string;
  slug: string;
  name: string;
  image: string;
  showOnHome: boolean;
  position: number;
  products: number;
};

function CategoryCard({ initial }: { initial: Row }) {
  const router = useRouter();
  const [row, setRow] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function set<K extends keyof Row>(key: K, value: Row[K]) {
    setRow((r) => ({ ...r, [key]: value }));
  }

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", files[0]);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error al subir");
      set("image", json.url);
      toast.success("Imagen subida. Falta guardar.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al subir");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    const res = await updateCategory(row.id, {
      name: row.name,
      image: row.image,
      showOnHome: row.showOnHome,
      position: row.position,
    });
    setSaving(false);
    if (res?.error) toast.error(res.error);
    else {
      toast.success(`"${row.name}" guardada`);
      router.refresh();
    }
  }

  return (
    <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:p-5">
      <div className="bg-sand relative aspect-[4/5] w-28 shrink-0 overflow-hidden rounded-xl sm:w-36">
        {row.image ? (
          <Image
            src={row.image}
            alt={row.name}
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <span className="text-muted absolute inset-0 flex items-center justify-center p-3 text-center text-xs">
            Usa la foto del último producto
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-3">
        <div className="grid gap-3 sm:grid-cols-[1fr_6rem]">
          <Field label="Nombre">
            <Input value={row.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Orden">
            <Input
              type="number"
              min={0}
              max={999}
              value={row.position}
              onChange={(e) => set("position", Number(e.target.value) || 0)}
            />
          </Field>
        </div>

        <label className="text-ink flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="size-4"
            checked={row.showOnHome}
            onChange={(e) => set("showOnHome", e.target.checked)}
          />
          Mostrar en la home
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <label className="border-line text-ink hover:bg-sand/50 inline-flex cursor-pointer items-center rounded-full border bg-white px-4 py-2 text-sm">
            {uploading ? "Subiendo..." : row.image ? "Cambiar foto" : "Subir foto"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="sr-only"
              disabled={uploading}
              onChange={(e) => upload(e.target.files)}
            />
          </label>
          {row.image && (
            <Button variant="ghost" onClick={() => set("image", "")}>
              Quitar foto
            </Button>
          )}
          <Button onClick={save} disabled={saving || uploading} className="ml-auto">
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </div>

        <p className="text-muted text-xs">
          {row.products} {row.products === 1 ? "producto" : "productos"} · /tienda?cat=
          {row.slug}
        </p>
      </div>
    </Card>
  );
}

export function CategoriesAdmin({ initial }: { initial: Row[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  async function create() {
    setCreating(true);
    const res = await createCategory(name);
    setCreating(false);
    if (res?.error) toast.error(res.error);
    else {
      toast.success("Categoría creada");
      setName("");
      router.refresh();
    }
  }

  return (
    <div className="mt-6 space-y-4">
      {initial.map((c) => (
        <CategoryCard key={c.id} initial={c} />
      ))}

      <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:p-5">
        <div className="flex-1">
          <Field label="Nueva categoría">
            <Input
              value={name}
              placeholder="Ej: Conjuntos"
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
        </div>
        <Button onClick={create} disabled={creating || !name.trim()}>
          {creating ? "Creando..." : "Agregar"}
        </Button>
      </Card>
    </div>
  );
}
