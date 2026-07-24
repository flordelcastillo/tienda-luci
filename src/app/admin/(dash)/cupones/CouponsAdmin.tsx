"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Eye, EyeOff, Ticket } from "lucide-react";
import { toast } from "sonner";
import { Button, Card, Field, Input, Select } from "@/components/ui";
import { formatARS, pesosToCents } from "@/lib/money";
import { couponSummary } from "@/lib/coupons";
import { createCoupon, setCouponActive, deleteCoupon } from "./actions";

type Coupon = {
  id: string;
  code: string;
  kind: string;
  value: number;
  minSubtotal: number;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
  expiresAt: string | null;
};

export function CouponsAdmin({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const [code, setCode] = useState("");
  const [kind, setKind] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState(""); // percent: %, fixed: pesos
  const [minSubtotal, setMinSubtotal] = useState(""); // pesos
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  function run(fn: () => Promise<{ error?: string; ok?: boolean }>, okMsg: string) {
    start(async () => {
      const res = await fn();
      if (res?.error) toast.error(res.error);
      else {
        toast.success(okMsg);
        router.refresh();
      }
    });
  }

  function submitNew() {
    // El valor fijo y el mínimo se ingresan en pesos → los pasamos a centavos.
    run(
      () =>
        createCoupon({
          code,
          kind,
          value: kind === "fixed" ? pesosToCents(value) : Number(value),
          minSubtotal: minSubtotal ? pesosToCents(minSubtotal) : 0,
          maxUses,
          expiresAt,
        }),
      "Cupón creado",
    );
    setCode("");
    setValue("");
    setMinSubtotal("");
    setMaxUses("");
    setExpiresAt("");
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4 p-6">
        <h2 className="font-display text-ink text-lg">Nuevo cupón</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Código">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ej: TEIA10"
              className="uppercase"
            />
          </Field>
          <Field label="Tipo">
            <Select value={kind} onChange={(e) => setKind(e.target.value as "percent" | "fixed")}>
              <option value="percent">Porcentaje (%)</option>
              <option value="fixed">Monto fijo ($)</option>
            </Select>
          </Field>
          <Field label={kind === "percent" ? "Descuento (%)" : "Descuento ($)"}>
            <Input
              type="number"
              min={1}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={kind === "percent" ? "10" : "500"}
            />
          </Field>
          <Field label="Mínimo de compra ($, opcional)">
            <Input
              type="number"
              min={0}
              value={minSubtotal}
              onChange={(e) => setMinSubtotal(e.target.value)}
              placeholder="Sin mínimo"
            />
          </Field>
          <Field label="Máximo de usos (opcional)">
            <Input
              type="number"
              min={1}
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              placeholder="Ilimitado"
            />
          </Field>
          <Field label="Vence el (opcional)">
            <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </Field>
        </div>
        <div className="flex justify-end">
          <Button disabled={pending || !code.trim() || !value.trim()} onClick={submitNew}>
            <Ticket className="size-4" />
            Crear cupón
          </Button>
        </div>
      </Card>

      {coupons.length === 0 ? (
        <p className="text-muted text-sm">Todavía no creaste ningún cupón.</p>
      ) : (
        <div className="space-y-2">
          {coupons.map((c) => {
            const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
            const usedUp = c.maxUses !== null && c.usedCount >= c.maxUses;
            return (
              <Card key={c.id} className="flex items-center gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-ink font-mono font-medium tracking-wide">
                      {c.code}
                    </span>
                    <span className="bg-sage/10 text-sage rounded-full px-2 py-0.5 text-xs">
                      {couponSummary(c)}
                    </span>
                    {!c.active && (
                      <span className="text-muted bg-sand rounded-full px-2 py-0.5 text-xs">
                        inactivo
                      </span>
                    )}
                    {expired && (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-600">
                        vencido
                      </span>
                    )}
                    {usedUp && (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-600">
                        agotado
                      </span>
                    )}
                  </div>
                  <p className="text-muted mt-1 text-xs">
                    {c.minSubtotal > 0 && `Mín. ${formatARS(c.minSubtotal)} · `}
                    Usos: {c.usedCount}
                    {c.maxUses !== null ? ` / ${c.maxUses}` : ""}
                    {c.expiresAt &&
                      ` · vence ${new Date(c.expiresAt).toLocaleDateString("es-AR")}`}
                  </p>
                </div>
                <button
                  onClick={() => run(() => setCouponActive(c.id, !c.active), "Cupón actualizado")}
                  className="text-muted hover:text-sage"
                  aria-label={c.active ? "Desactivar" : "Activar"}
                  title={c.active ? "Desactivar" : "Activar"}
                >
                  {c.active ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </button>
                <button
                  onClick={() => run(() => deleteCoupon(c.id), "Cupón eliminado")}
                  className="text-muted hover:text-red-600"
                  aria-label="Eliminar"
                  title="Eliminar"
                >
                  <Trash2 className="size-4" />
                </button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
