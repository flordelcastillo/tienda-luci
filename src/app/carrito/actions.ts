"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCartLines, saveCartLines } from "@/lib/cart-server";
import { addLine, setQty, removeLine } from "@/lib/cart";

// Agrega un producto+variante al carrito y lleva al usuario al carrito.
export async function addToCartAction(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const variantId = String(formData.get("variantId") ?? "");
  const qty = Number(formData.get("qty") ?? 1);
  if (!productId || !variantId) return;

  const lines = await getCartLines();
  await saveCartLines(addLine(lines, { productId, variantId, qty }));
  revalidatePath("/carrito");
  redirect("/carrito");
}

// Fija la cantidad de una línea (qty <= 0 la elimina).
export async function updateQtyAction(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const variantId = String(formData.get("variantId") ?? "");
  const qty = Number(formData.get("qty") ?? 0);
  if (!productId || !variantId) return;

  const lines = await getCartLines();
  await saveCartLines(setQty(lines, { productId, variantId }, qty));
  revalidatePath("/carrito");
}

// Elimina una línea del carrito.
export async function removeFromCartAction(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const variantId = String(formData.get("variantId") ?? "");
  if (!productId || !variantId) return;

  const lines = await getCartLines();
  await saveCartLines(removeLine(lines, { productId, variantId }));
  revalidatePath("/carrito");
}
