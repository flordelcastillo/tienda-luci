"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { pesosToCents } from "@/lib/money";

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const variantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  sku: z.string().min(1),
  priceDelta: z.number().int(),
  stock: z.number().int().min(0),
});

const productSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio"),
  description: z.string().default(""),
  material: z.string().default(""),
  gemstone: z.string().default(""),
  basePrice: z.number().int().positive("El precio debe ser mayor a 0"),
  compareAtPrice: z.number().int().positive().nullable().default(null),
  categoryId: z.string().nullable(),
  active: z.boolean(),
  featured: z.boolean(),
  metal: z.string().default(""),
  stoneColor: z.string().default(""),
  theme: z.string().default(""),
  waterproof: z.boolean().default(true),
  hypoallergenic: z.boolean().default(true),
  giftIdea: z.boolean().default(false),
  giftWrap: z.boolean().default(false),
  measurements: z.string().default(""),
  audience: z.string().default("mujer"),
  images: z.array(z.object({ url: z.string(), alt: z.string().default("") })),
  variants: z.array(variantSchema).min(1, "Agregá al menos una variante"),
});

// Campos de marketing/atributos que se comparten entre create y update.
function attrData(data: z.infer<typeof productSchema>) {
  return {
    compareAtPrice: data.compareAtPrice,
    metal: data.metal,
    stoneColor: data.stoneColor,
    theme: data.theme,
    waterproof: data.waterproof,
    hypoallergenic: data.hypoallergenic,
    giftIdea: data.giftIdea,
    giftWrap: data.giftWrap,
    measurements: data.measurements,
    audience: data.audience,
  };
}

// El form envía un JSON stringificado en el campo "payload".
function parsePayload(formData: FormData) {
  const raw = formData.get("payload");
  if (typeof raw !== "string") throw new Error("Payload inválido");
  const json = JSON.parse(raw);
  // basePrice, compareAtPrice y priceDelta llegan en pesos → convertir a centavos
  json.basePrice = pesosToCents(json.basePrice);
  const compareCents = pesosToCents(String(json.compareAtPrice ?? ""));
  json.compareAtPrice = compareCents > 0 ? compareCents : null;
  json.variants = (json.variants ?? []).map((v: Record<string, unknown>) => ({
    ...v,
    priceDelta: pesosToCents(String(v.priceDelta ?? "0")),
    stock: parseInt(String(v.stock ?? "0"), 10) || 0,
  }));
  return json;
}

export async function createProduct(_prev: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "No autorizado" };

  let data;
  try {
    data = productSchema.parse(parsePayload(formData));
  } catch (e) {
    if (e instanceof z.ZodError) return { error: e.issues[0].message };
    return { error: "Datos inválidos" };
  }

  let slug = slugify(data.name);
  if (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  await prisma.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      material: data.material,
      gemstone: data.gemstone,
      basePrice: data.basePrice,
      categoryId: data.categoryId || null,
      active: data.active,
      featured: data.featured,
      ...attrData(data),
      images: {
        create: data.images.map((img, i) => ({
          url: img.url,
          alt: img.alt || data.name,
          position: i,
        })),
      },
      variants: {
        create: data.variants.map((v) => ({
          name: v.name,
          sku: v.sku,
          priceDelta: v.priceDelta,
          stock: v.stock,
        })),
      },
    },
  });

  revalidatePath("/admin/productos");
  redirect("/admin/productos");
}

export async function updateProduct(id: string, _prev: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "No autorizado" };

  let data;
  try {
    data = productSchema.parse(parsePayload(formData));
  } catch (e) {
    if (e instanceof z.ZodError) return { error: e.issues[0].message };
    return { error: "Datos inválidos" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        material: data.material,
        gemstone: data.gemstone,
        basePrice: data.basePrice,
        categoryId: data.categoryId || null,
        active: data.active,
        featured: data.featured,
        ...attrData(data),
      },
    });

    // Reemplaza imágenes
    await tx.productImage.deleteMany({ where: { productId: id } });
    await tx.productImage.createMany({
      data: data.images.map((img, i) => ({
        productId: id,
        url: img.url,
        alt: img.alt || data.name,
        position: i,
      })),
    });

    // Sincroniza variantes: actualiza existentes, crea nuevas, borra las quitadas
    const existing = await tx.productVariant.findMany({ where: { productId: id } });
    const keepIds = data.variants.filter((v) => v.id).map((v) => v.id!);
    const toDelete = existing.filter((e) => !keepIds.includes(e.id));
    if (toDelete.length) {
      await tx.productVariant.deleteMany({
        where: { id: { in: toDelete.map((v) => v.id) } },
      });
    }
    for (const v of data.variants) {
      if (v.id) {
        await tx.productVariant.update({
          where: { id: v.id },
          data: { name: v.name, sku: v.sku, priceDelta: v.priceDelta, stock: v.stock },
        });
      } else {
        await tx.productVariant.create({
          data: {
            productId: id,
            name: v.name,
            sku: v.sku,
            priceDelta: v.priceDelta,
            stock: v.stock,
          },
        });
      }
    }
  });

  revalidatePath("/admin/productos");
  revalidatePath("/admin/inventario");
  redirect("/admin/productos");
}

// Edición en lote: aplica un mismo atributo a una selección de productos.
const BULK_STRING_FIELDS = ["metal", "stoneColor", "theme", "audience"] as const;
const BULK_BOOL_FIELDS = [
  "waterproof",
  "hypoallergenic",
  "giftIdea",
  "giftWrap",
  "featured",
  "active",
] as const;

const bulkSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "Elegí al menos un producto"),
  field: z.enum([...BULK_STRING_FIELDS, ...BULK_BOOL_FIELDS]),
  value: z.union([z.string(), z.boolean()]),
});

export async function bulkUpdateProducts(input: {
  ids: string[];
  field: string;
  value: string | boolean;
}) {
  const session = await getSession();
  if (!session) return { error: "No autorizado" };

  let data;
  try {
    data = bulkSchema.parse(input);
  } catch (e) {
    if (e instanceof z.ZodError) return { error: e.issues[0].message };
    return { error: "Datos inválidos" };
  }

  const isBool = (BULK_BOOL_FIELDS as readonly string[]).includes(data.field);
  const value = isBool ? Boolean(data.value) : String(data.value);

  const count = await prisma.product.updateMany({
    where: { id: { in: data.ids } },
    data: { [data.field]: value },
  });

  revalidatePath("/admin/productos");
  revalidatePath("/tienda");
  return { ok: true, count: count.count };
}

export async function toggleActive(id: string, active: boolean) {
  const session = await getSession();
  if (!session) return { error: "No autorizado" };
  await prisma.product.update({ where: { id }, data: { active } });
  revalidatePath("/admin/productos");
  return { ok: true };
}

export async function deleteProduct(id: string) {
  const session = await getSession();
  if (!session) return { error: "No autorizado" };
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/productos");
  redirect("/admin/productos");
}
