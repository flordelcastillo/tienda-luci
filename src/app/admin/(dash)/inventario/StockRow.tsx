"use client";

import { useState, useTransition } from "react";
import { Minus, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui";
import { updateStock, adjustStock } from "./actions";

type Props = {
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  initialStock: number;
};

export function StockRow({
  variantId,
  productName,
  variantName,
  sku,
  initialStock,
}: Props) {
  const [stock, setStock] = useState(initialStock);
  const [draft, setDraft] = useState(String(initialStock));
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  function bump(delta: number) {
    start(async () => {
      const res = await adjustStock(variantId, delta);
      if (res.ok) {
        setStock(res.stock!);
        setDraft(String(res.stock));
        flash();
      } else if (res.error) {
        toast.error(res.error);
      }
    });
  }

  function save() {
    const val = parseInt(draft, 10);
    if (Number.isNaN(val) || val === stock) return;
    start(async () => {
      const res = await updateStock(variantId, val);
      if (res.ok) {
        setStock(val);
        flash();
        toast.success(`Stock de ${productName} actualizado`);
      } else if (res.error) {
        toast.error(res.error);
      }
    });
  }

  function flash() {
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  }

  const tone = stock === 0 ? "red" : stock <= 3 ? "gold" : "sage";

  return (
    <tr className="border-line border-b last:border-0">
      <td className="py-3 pr-4">
        <p className="text-ink text-sm">{productName}</p>
        <p className="text-muted text-xs">{variantName}</p>
      </td>
      <td className="text-muted py-3 pr-4 font-mono text-sm">{sku}</td>
      <td className="py-3 pr-4">
        <Badge tone={tone}>
          {stock === 0 ? "Sin stock" : stock <= 3 ? "Bajo" : "OK"}
        </Badge>
      </td>
      <td className="py-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => bump(-1)}
            disabled={pending || stock === 0}
            className="border-line text-ink hover:bg-sand/60 flex h-8 w-8 items-center justify-center rounded-full border disabled:opacity-40"
            aria-label="Restar uno"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ""))}
            onBlur={save}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            className="border-line focus:border-sage w-16 rounded-lg border py-1.5 text-center text-sm outline-none"
          />
          <button
            onClick={() => bump(1)}
            disabled={pending}
            className="border-line text-ink hover:bg-sand/60 flex h-8 w-8 items-center justify-center rounded-full border disabled:opacity-40"
            aria-label="Sumar uno"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          {saved && <Check className="text-sage ml-1 h-4 w-4" />}
        </div>
      </td>
    </tr>
  );
}
