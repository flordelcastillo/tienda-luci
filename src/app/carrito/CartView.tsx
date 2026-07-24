"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, MessageCircle, CheckCircle2 } from "lucide-react";
import { Button, Card, Field, Input, Select } from "@/components/ui";
import { formatARS } from "@/lib/money";
import { useCart, setQty, removeLine, clearCart, lineKey, type CartItem } from "@/lib/cart";
import { DELIVERY_OPTIONS, deliveryLabel, needsAddress } from "@/lib/delivery";
import { createOrder } from "./actions";

// Arma el mensaje de WhatsApp del pedido. Texto plano, sin emojis, para que se
// vea bien en cualquier dispositivo.
function buildMessage(
  orderNumber: number,
  cart: CartItem[],
  customer: {
    name: string;
    phone: string;
    addr: string;
    email: string;
    deliveryZone: string;
  },
) {
  const lines = cart.map((i) => {
    const variant = i.variantName ? ` (${i.variantName})` : "";
    const gift = i.gift ? " + cajita de regalo" : "";
    return `- ${i.name}${variant}${gift} x${i.qty} - ${formatARS(i.unitPrice * i.qty)}`;
  });
  const total = cart.reduce((a, i) => a + i.unitPrice * i.qty, 0);

  return (
    `Hola Teia! Te hago este pedido (#${orderNumber}):\n\n` +
    `${lines.join("\n")}\n\n` +
    `Total: ${formatARS(total)}\n\n` +
    `Mis datos:\n` +
    `Nombre: ${customer.name}\n` +
    `Telefono: ${customer.phone}\n` +
    `Entrega: ${deliveryLabel(customer.deliveryZone)}\n` +
    (customer.addr ? `Direccion: ${customer.addr}\n` : "") +
    (customer.email ? `Email: ${customer.email}\n` : "") +
    `\nQuedo a la espera de los datos para transferir. Gracias!`
  );
}

export function CartView({ whatsappNumber }: { whatsappNumber: string }) {
  const cart = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addr, setAddr] = useState("");
  const [email, setEmail] = useState("");
  const [deliveryZone, setDeliveryZone] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ number: number; url: string } | null>(null);

  const total = cart.reduce((a, i) => a + i.unitPrice * i.qty, 0);

  async function finish() {
    setError(null);
    if (!name.trim() || !phone.trim()) {
      setError("Completá al menos tu nombre y teléfono.");
      return;
    }
    if (!deliveryZone) {
      setError("Elegí cómo querés recibir el pedido.");
      return;
    }
    if (needsAddress(deliveryZone) && !addr.trim()) {
      setError("Completá la dirección para el envío.");
      return;
    }
    setSubmitting(true);
    const customer = {
      name: name.trim(),
      phone: phone.trim(),
      addr: addr.trim(),
      email: email.trim(),
      deliveryZone,
    };
    const res = await createOrder({
      items: cart.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.qty,
        gift: i.gift,
      })),
      customer,
    });

    if (!res.ok) {
      setError(res.error);
      setSubmitting(false);
      return;
    }

    const message = buildMessage(res.orderNumber, cart, customer);
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    clearCart();
    setDone({ number: res.orderNumber, url });
  }

  // Pantalla de confirmación: el pedido ya quedó registrado en el panel.
  if (done) {
    return (
      <Card className="mt-8 space-y-4 p-8 text-center">
        <CheckCircle2 className="text-sage mx-auto size-12" />
        <div>
          <h2 className="font-display text-ink text-2xl">¡Pedido #{done.number} creado!</h2>
          <p className="text-muted mt-2 text-sm">
            Tocá el botón para enviarnos el pedido por WhatsApp y te pasamos los datos
            para transferir. Ya lo tenemos registrado.
          </p>
        </div>
        <a
          href={done.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mx-auto flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-3 font-medium text-white transition-colors hover:bg-[#1eb858]"
        >
          <MessageCircle className="size-5" />
          Enviar pedido por WhatsApp
        </a>
        <Link href="/tienda" className="text-sage block text-sm hover:underline">
          Seguir mirando
        </Link>
      </Card>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="mt-10 text-center">
        <p className="text-muted">Tu carrito está vacío.</p>
        <Link
          href="/tienda"
          className="bg-sage text-cream mt-4 inline-block rounded-full px-5 py-2.5 text-sm transition-colors hover:bg-[#2f3c33]"
        >
          Ir a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
      {/* Ítems */}
      <div className="space-y-4">
        {cart.map((i) => {
          const key = lineKey(i);
          return (
            <Card key={key} className="flex gap-4 p-4">
              <div className="bg-sand relative size-20 shrink-0 overflow-hidden rounded-xl">
                {i.image && (
                  <Image src={i.image} alt={i.name} fill unoptimized className="object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/producto/${i.slug}`} className="text-ink hover:text-sage">
                  {i.name}
                </Link>
                {i.variantName && <p className="text-muted text-xs">{i.variantName}</p>}
                {i.gift && <p className="text-gold-dark text-xs">Con cajita de regalo</p>}
                <p className="text-sage mt-1 text-sm font-medium">{formatARS(i.unitPrice)}</p>

                <div className="mt-2 flex items-center gap-3">
                  <div className="border-line flex items-center rounded-full border">
                    <button
                      onClick={() => setQty(key, i.qty - 1)}
                      className="h-8 w-8 text-lg"
                      aria-label="Restar"
                    >
                      −
                    </button>
                    <span className="w-7 text-center text-sm">{i.qty}</span>
                    <button
                      onClick={() => setQty(key, i.qty + 1)}
                      className="h-8 w-8 text-lg"
                      aria-label="Sumar"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeLine(key)}
                    className="text-muted hover:text-red-600"
                    aria-label="Quitar"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              <div className="text-ink text-right text-sm font-medium">
                {formatARS(i.unitPrice * i.qty)}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Resumen + datos */}
      <div className="space-y-4">
        <Card className="space-y-3 p-5">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Subtotal</span>
            <span className="text-ink">{formatARS(total)}</span>
          </div>
          <p className="text-muted text-xs">El envío se coordina por WhatsApp.</p>
          <div className="border-line flex justify-between border-t pt-3">
            <span className="text-ink font-medium">Total</span>
            <span className="font-display text-sage text-xl">{formatARS(total)}</span>
          </div>
        </Card>

        <Card className="space-y-3 p-5">
          <h2 className="font-display text-ink text-lg">Tus datos</h2>
          <Field label="Nombre y apellido">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Teléfono / WhatsApp">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          <Field label="¿Cómo lo recibís?">
            <Select
              value={deliveryZone}
              onChange={(e) => setDeliveryZone(e.target.value)}
            >
              <option value="">Elegí una opción…</option>
              {DELIVERY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
          {needsAddress(deliveryZone) && (
            <Field label="Dirección de envío">
              <Input value={addr} onChange={(e) => setAddr(e.target.value)} />
            </Field>
          )}
          <Field label="Email (opcional)">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button size="lg" className="w-full" disabled={submitting} onClick={finish}>
            <MessageCircle className="size-5" />
            {submitting ? "Generando pedido…" : "Finalizar por WhatsApp"}
          </Button>
          <p className="text-muted text-center text-xs">
            Coordinás el pago por transferencia en el chat.
          </p>
        </Card>
      </div>
    </div>
  );
}
