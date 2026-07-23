"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function updateStock(variantId: string, stock: number) {
  const session = await getSession();
  if (!session) return { error: "No autorizado" };
  if (!Number.isInteger(stock) || stock < 0) return { error: "Stock inválido" };

  await prisma.productVariant.update({
    where: { id: variantId },
    data: { stock },
  });
  revalidatePath("/admin/inventario");
  revalidatePath("/admin");
  return { ok: true };
}

export async function adjustStock(variantId: string, delta: number) {
  const session = await getSession();
  if (!session) return { error: "No autorizado" };

  const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
  if (!variant) return { error: "Variante no encontrada" };

  const next = Math.max(0, variant.stock + delta);
  await prisma.productVariant.update({
    where: { id: variantId },
    data: { stock: next },
  });
  revalidatePath("/admin/inventario");
  revalidatePath("/admin");
  return { ok: true, stock: next };
}
