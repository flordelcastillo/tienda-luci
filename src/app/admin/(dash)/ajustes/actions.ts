"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const hex = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Color inválido")
  .or(z.literal(""));

const schema = z.object({
  brandName: z.string().max(50).default(""),
  announcement: z.string().max(200).default(""),
  heroKicker: z.string().max(80).default(""),
  heroTitle: z.string().max(120).default(""),
  heroSubtitle: z.string().max(400).default(""),
  heroTagline: z.string().max(160).default(""),
  heroImage: z.string().max(300).default(""),
  footerText: z.string().max(400).default(""),
  whatsapp: z.string().max(20).default(""),
  freeShippingPesos: z.number().int().min(0).default(0),
  colorPrimary: hex.default(""),
  colorAccent: hex.default(""),
  colorBg: hex.default(""),
  colorNeutral: hex.default(""),
  colorRose: hex.default(""),
  colorText: hex.default(""),
});

export async function updateSettings(raw: unknown) {
  const session = await getSession();
  if (!session) return { error: "No autorizado" };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const { freeShippingPesos, whatsapp, ...rest } = parsed.data;

  const data = {
    ...rest,
    // Solo dígitos en el número de WhatsApp (formato wa.me).
    whatsapp: whatsapp.replace(/\D/g, ""),
    freeShippingCents: Math.round(freeShippingPesos * 100),
  };

  await prisma.siteSetting.upsert({
    where: { id: "main" },
    create: { id: "main", ...data },
    update: data,
  });

  // La config afecta a todo el sitio (colores, textos, header/footer).
  revalidatePath("/", "layout");
  return { ok: true };
}
