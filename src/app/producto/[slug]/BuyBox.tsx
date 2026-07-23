"use client";

import { useState } from "react";
import { Button, Field, Input } from "@/components/ui";
import { formatARS } from "@/lib/money";

type Variant = { id: string; name: string; priceDelta: number; stock: number };

export function BuyBox({
  productId,
  basePrice,
  variants,
}: {
  productId: string;
  basePrice: number;
  variants: Variant[];
}) {
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const [step, setStep] = useState<"pick" | "data">("pick");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addr, setAddr] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const variant = variants.find((v) => v.id === variantId);
  const price = basePrice + (variant?.priceDelta ?? 0);
  const total = price * qty;
  const maxQty = variant?.stock ?? 0;

  async function checkout() {
    setError(null);
    if (!name || !email) {
      setError("Completá nombre y email");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          variantId,
          quantity: qty,
          customer: { name, email, phone, addr },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error al procesar");
      window.location.href = json.initPoint;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <span className="font-display text-sage text-3xl">{formatARS(price)}</span>
      </div>

      {variants.length > 1 && (
        <div>
          <p className="text-ink mb-2 text-sm font-medium">Variante</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                disabled={v.stock === 0}
                onClick={() => setVariantId(v.id)}
                className={`rounded-full border px-4 py-2 text-sm transition-colors disabled:line-through disabled:opacity-40 ${
                  variantId === v.id
                    ? "bg-sage text-cream border-sage"
                    : "border-line text-ink hover:border-sage bg-white"
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-muted text-sm">
        {maxQty > 0 ? `${maxQty} disponibles` : "Sin stock"}
      </p>

      {step === "pick" ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="border-line flex items-center rounded-full border">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="h-10 w-10 text-lg"
              >
                −
              </button>
              <span className="w-8 text-center">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                className="h-10 w-10 text-lg"
              >
                +
              </button>
            </div>
            <span className="text-muted text-sm">Total: {formatARS(total)}</span>
          </div>
          <Button
            className="w-full"
            disabled={maxQty === 0}
            onClick={() => setStep("data")}
          >
            {maxQty === 0 ? "Sin stock" : "Comprar ahora"}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <Field label="Nombre y apellido">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Teléfono">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          <Field label="Dirección de envío">
            <Input value={addr} onChange={(e) => setAddr(e.target.value)} />
          </Field>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button className="flex-1" disabled={loading} onClick={checkout}>
              {loading ? "Redirigiendo…" : `Pagar ${formatARS(total)}`}
            </Button>
            <Button variant="ghost" onClick={() => setStep("pick")}>
              Volver
            </Button>
          </div>
          <p className="text-muted text-center text-xs">
            Serás redirigido a Mercado Pago para completar el pago.
          </p>
        </div>
      )}
      {step === "pick" && error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
