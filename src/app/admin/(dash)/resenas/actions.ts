"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const addSchema = z.object({
  productId: z.string().min(1, "Elegí un producto"),
  author: z.string().min(1, "Falta el nombre"),
  rating: z.number().int().min(1).max(5),
  text: z.string().min(1, "Falta el texto"),
  approved: z.boolean().default(true),
});

async function requireSession() {
  const session = await getSession();
  return !!session;
}

export async function addReview(raw: unknown) {
  if (!(await requireSession())) return { error: "No autorizado" };
  const parsed = addSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product) return { error: "Producto no encontrado" };

  await prisma.review.create({ data: parsed.data });
  revalidatePath("/admin/resenas");
  revalidatePath(`/producto/${product.slug}`);
  return { ok: true };
}

export async function setReviewApproved(id: string, approved: boolean) {
  if (!(await requireSession())) return { error: "No autorizado" };
  const review = await prisma.review.update({
    where: { id },
    data: { approved },
    include: { product: true },
  });
  revalidatePath("/admin/resenas");
  revalidatePath(`/producto/${review.product.slug}`);
  return { ok: true };
}

export async function deleteReview(id: string) {
  if (!(await requireSession())) return { error: "No autorizado" };
  const review = await prisma.review.delete({
    where: { id },
    include: { product: true },
  });
  revalidatePath("/admin/resenas");
  revalidatePath(`/producto/${review.product.slug}`);
  return { ok: true };
}
