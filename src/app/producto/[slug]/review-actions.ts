"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Reseña dejada por una clienta desde la ficha del producto. Nace SIN aprobar:
// queda pendiente en /admin/resenas y no se muestra en la tienda hasta que el
// vendedor la aprueba (evita spam/insultos en público).
const schema = z.object({
  slug: z.string().min(1),
  author: z.string().trim().min(1, "Poné tu nombre").max(60),
  rating: z.coerce.number().int().min(1).max(5),
  text: z.string().trim().min(3, "Contanos un poco más").max(600),
});

export type SubmitReviewResult = { ok: true } | { ok: false; error: string };

export async function submitReview(raw: unknown): Promise<SubmitReviewResult> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const { slug, author, rating, text } = parsed.data;

  const product = await prisma.product.findFirst({
    where: { slug, active: true },
    select: { id: true },
  });
  if (!product) return { ok: false, error: "Producto no encontrado" };

  await prisma.review.create({
    data: { productId: product.id, author, rating, text, approved: false },
  });
  revalidatePath(`/producto/${slug}`);
  return { ok: true };
}
