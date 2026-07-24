"use client";

import { useState } from "react";
import { Button, Field, Input } from "@/components/ui";
import { formatARS } from "@/lib/money";

type CheckoutItem = { productId: string; variantId: string; quantity: number };

// Formulario de datos del cliente + checkout de todo el carrito contra
// /api/checkout (multi-item). Redirige a Mercado Pago con la preferencia creada.
export function CartCheckout({
  items,
  total,
}: {
  items: CheckoutItem[];
  total: number;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addr, setAddr] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        body: JSON.stringify({ items, customer: { name, email, phone, addr } }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error al procesar");
      window.location.href = json.initPoint;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button className="w-full" disabled={items.length === 0} onClick={() => setOpen(true)}>
        Finalizar compra
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      <Field label="Nombre y apellido">
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Email">
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field label="Teléfono">
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </Field>
      <Field label="Dirección de envío">
        <Input value={addr} onChange={(e) => setAddr(e.target.value)} />
      </Field>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button className="w-full" disabled={loading} onClick={checkout}>
        {loading ? "Redirigiendo…" : `Pagar ${formatARS(total)}`}
      </Button>
      <p className="text-muted text-center text-xs">
        Serás redirigido a Mercado Pago para completar el pago.
      </p>
    </div>
  );
}
