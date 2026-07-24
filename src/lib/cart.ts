"use client";

// Carrito del cliente: vive en localStorage (sin sesión de servidor) y se comparte
// entre componentes con useSyncExternalStore. Al finalizar, el pedido se manda a
// una server action que crea la Orden real en la base.
import { useSyncExternalStore } from "react";

export type CartItem = {
  productId: string;
  variantId: string;
  slug: string;
  name: string; // nombre del producto
  variantName: string; // "" si no tiene variantes reales
  unitPrice: number; // centavos (base + delta de la variante)
  image: string;
  gift: boolean; // con cajita de regalo
  qty: number;
};

const KEY = "teia-cart-v1";
const EMPTY: CartItem[] = [];

let items: CartItem[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    items = raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    items = [];
  }
  loaded = true;
}

function commit(next: CartItem[]) {
  items = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // sin acceso a localStorage: se mantiene solo en memoria.
  }
  listeners.forEach((l) => l());
}

/** Clave de línea: mismo producto + variante + opción de regalo se agrupan. */
export function lineKey(i: {
  productId: string;
  variantId: string;
  gift: boolean;
}): string {
  return `${i.productId}__${i.variantId}__${i.gift ? "g" : "n"}`;
}

export function addToCart(item: CartItem) {
  ensureLoaded();
  const key = lineKey(item);
  const existing = items.find((i) => lineKey(i) === key);
  if (existing) {
    commit(
      items.map((i) => (i === existing ? { ...i, qty: i.qty + item.qty } : i)),
    );
  } else {
    commit([...items, item]);
  }
}

export function setQty(key: string, qty: number) {
  ensureLoaded();
  if (qty <= 0) return removeLine(key);
  commit(items.map((i) => (lineKey(i) === key ? { ...i, qty } : i)));
}

export function removeLine(key: string) {
  ensureLoaded();
  commit(items.filter((i) => lineKey(i) !== key));
}

export function clearCart() {
  commit([]);
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  ensureLoaded();
  return items;
}

function getServerSnapshot() {
  return EMPTY;
}

/** Devuelve los ítems del carrito, reactivo a los cambios. */
export function useCart(): CartItem[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Cantidad total de unidades (para el contador del header). */
export function useCartCount(): number {
  const cart = useCart();
  return cart.reduce((a, i) => a + i.qty, 0);
}
