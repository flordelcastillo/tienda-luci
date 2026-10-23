"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const image = z
  .string()
  .max(300)
  .refine(
    (v) => v === "" || v.startsWith("/") || v.startsWith("https://"),
    "Imagen inválida",
  );

const schema = z.object({
  name: z.string().trim().min(1, "Poné un nombre").max(40),
  image: image.default(""),
  showOnHome: z.boolean(),
  position: z.number().int().min(0).max(999),
});

function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function refresh() {
  // Las categorías se ven en la home, en la tienda y en el formulario de productos.
  revalidatePath("/");
  revalidatePath("/tienda");
  revalidatePath("/admin/categorias");
}

export async function updateCategory(id: string, raw: unknown) {
  const session = await getSession();
  if (!session) return { error: "No autorizado" };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  try {
    await prisma.category.update({ where: { id }, data: parsed.data });
  } catch {
    return { error: "No se encontró la categoría" };
  }
  refresh();
  return { ok: true };
}

export async function createCategory(rawName: string) {
  const session = await getSession();
  if (!session) return { error: "No autorizado" };

  const name = String(rawName ?? "").trim();
  if (!name || name.length > 40) return { error: "Poné un nombre (hasta 40 letras)" };
  const slug = slugify(name);
  if (!slug) return { error: "Nombre inválido" };
  if (await prisma.category.findUnique({ where: { slug } })) {
    return { error: "Ya existe una categoría con ese nombre" };
  }

  const last = await prisma.category.aggregate({ _max: { position: true } });
  await prisma.category.create({
    data: { name, slug, position: (last._max.position ?? 0) + 1 },
  });
  refresh();
  return { ok: true };
}
