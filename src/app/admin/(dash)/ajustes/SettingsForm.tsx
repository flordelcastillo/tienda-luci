"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, Card, Field, Input, Textarea } from "@/components/ui";
import { updateSettings } from "./actions";

type Initial = {
  brandName: string;
  announcement: string;
  heroKicker: string;
  heroTitle: string;
  heroSubtitle: string;
  heroTagline: string;
  heroImage: string;
  footerText: string;
  whatsapp: string;
  notifyEmail: string;
  freeShippingPesos: number;
  colorPrimary: string;
  colorAccent: string;
  colorBg: string;
  colorNeutral: string;
  colorRose: string;
  colorText: string;
};

export function SettingsForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [form, setForm] = useState<Initial>(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function set<K extends keyof Initial>(key: K, value: Initial[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function uploadHero(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", files[0]);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error al subir");
      set("heroImage", json.url);
      toast.success("Imagen subida");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al subir");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    const res = await updateSettings(form);
    setSaving(false);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Cambios guardados");
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4 p-6">
        <h2 className="font-display text-ink text-lg">Marca y textos</h2>
        <Field label="Nombre de la marca">
          <Input value={form.brandName} onChange={(e) => set("brandName", e.target.value)} />
        </Field>
        <Field label="Barra de anuncio (arriba de todo)">
          <Input
            value={form.announcement}
            onChange={(e) => set("announcement", e.target.value)}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Bajada del hero (arriba del título)">
            <Input value={form.heroKicker} onChange={(e) => set("heroKicker", e.target.value)} />
          </Field>
          <Field label="Título principal">
            <Input value={form.heroTitle} onChange={(e) => set("heroTitle", e.target.value)} />
          </Field>
        </div>
        <Field label="Subtítulo del hero">
          <Textarea
            rows={3}
            value={form.heroSubtitle}
            onChange={(e) => set("heroSubtitle", e.target.value)}
          />
        </Field>
        <Field label="Frase destacada (dorada)">
          <Input value={form.heroTagline} onChange={(e) => set("heroTagline", e.target.value)} />
        </Field>
        <Field label="Texto del pie de página">
          <Textarea
            rows={3}
            value={form.footerText}
            onChange={(e) => set("footerText", e.target.value)}
          />
        </Field>
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="font-display text-ink text-lg">Imagen del hero</h2>
        <p className="text-muted text-sm">
          Foto grande de la portada. Si la dejás vacía, se usa la primera pieza destacada.
        </p>
        {form.heroImage && (
          <div className="bg-sand relative aspect-[4/5] w-40 overflow-hidden rounded-xl">
            <Image src={form.heroImage} alt="Hero" fill unoptimized className="object-cover" />
          </div>
        )}
        <div className="flex items-center gap-3">
          <label className="border-sage text-sage hover:bg-sage hover:text-cream cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors">
            {uploading ? "Subiendo…" : "Subir imagen"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => uploadHero(e.target.files)}
            />
          </label>
          {form.heroImage && (
            <Button variant="ghost" onClick={() => set("heroImage", "")}>
              Quitar
            </Button>
          )}
        </div>
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="font-display text-ink text-lg">Colores</h2>
        <p className="text-muted text-sm">
          Tocá cada color para cambiarlo. Se aplican a toda la tienda.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <ColorField label="Principal (marca)" value={form.colorPrimary} onChange={(v) => set("colorPrimary", v)} />
          <ColorField label="Acento (dorado)" value={form.colorAccent} onChange={(v) => set("colorAccent", v)} />
          <ColorField label="Fondo (crema)" value={form.colorBg} onChange={(v) => set("colorBg", v)} />
          <ColorField label="Neutro cálido" value={form.colorNeutral} onChange={(v) => set("colorNeutral", v)} />
          <ColorField label="Rosa (detalles)" value={form.colorRose} onChange={(v) => set("colorRose", v)} />
          <ColorField label="Texto" value={form.colorText} onChange={(v) => set("colorText", v)} />
        </div>
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="font-display text-ink text-lg">Contacto y ventas</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="WhatsApp (formato internacional sin +)"
            hint="Ej: 5492657528266"
          >
            <Input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
          </Field>
          <Field label="Envío gratis desde ($)" hint="0 = sin envío gratis">
            <Input
              type="number"
              min={0}
              value={form.freeShippingPesos}
              onChange={(e) => set("freeShippingPesos", Number(e.target.value))}
            />
          </Field>
        </div>
        <Field
          label="Email para avisos de pedidos"
          hint="Te llega un mail cuando entra un pedido nuevo (requiere configurar el envío en el servidor)."
        >
          <Input
            type="email"
            value={form.notifyEmail}
            onChange={(e) => set("notifyEmail", e.target.value)}
            placeholder="tuemail@gmail.com"
          />
        </Field>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" disabled={saving || uploading} onClick={save}>
          {saving ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border-line h-10 w-14 rounded-lg border"
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="w-32" />
      </div>
    </Field>
  );
}
