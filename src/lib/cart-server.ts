import { cookies } from "next/headers";
import { parseCart, serializeCart, cartCount, type CartLine } from "./cart";

const CART_COOKIE = "luci_cart";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 días

// Lee las líneas del carrito desde la cookie. Seguro de usar durante el render.
export async function getCartLines(): Promise<CartLine[]> {
  const store = await cookies();
  return parseCart(store.get(CART_COOKIE)?.value);
}

// Cantidad total de unidades en el carrito (para el badge del header).
export async function getCartCount(): Promise<number> {
  return cartCount(await getCartLines());
}

// Persiste el carrito. Solo se puede llamar desde Server Actions o Route Handlers.
// Un carrito vacío borra la cookie para no dejar basura.
export async function saveCartLines(lines: CartLine[]): Promise<void> {
  const store = await cookies();
  if (lines.length === 0) {
    store.delete(CART_COOKIE);
    return;
  }
  store.set(CART_COOKIE, serializeCart(lines), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}
