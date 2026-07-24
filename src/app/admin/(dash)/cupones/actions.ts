"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { normalizeCode } from "@/lib/coupons";

async function requireSession() {
  return !!(await getSession());
}

const createSchema = z
  .object({
    code: z.string().trim().min(2, "El código es muy corto").max(30),
    kind: z.enum(["percent", "fixed"]),
    value: z.coerce.number().int().positive("Poné un valor mayor a 0"),
    minSubtotal: z.coerce.number().int().min(0).default(0), // en centavos
    // "" (campo vacío) → null. Ojo: sin el preprocess, coerce.number("") daría 0.
    maxUses: z.preprocess(
      (v) => (v === "" || v == null ? null : v),
      z.coerce.number().int().positive().nullable(),
    ),
    expiresAt: z.preprocess(
      (v) => (v ? new Date(v as string) : null),
      z.date().nullable(),
    ),
  })
  .refine((d) => d.kind !== "percent" || d.value <= 100, {
    message: "Un porcentaje no puede superar 100",
    path: ["value"],
  });

export async function createCoupon(raw: unknown) {
  if (!(await requireSession())) return { error: "No autorizado" };
  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const code = normalizeCode(parsed.data.code);
  const exists = await prisma.coupon.findUnique({ where: { code } });
  if (exists) return { error: "Ya existe un cupón con ese código" };

  await prisma.coupon.create({
    data: {
      code,
      kind: parsed.data.kind,
      value: parsed.data.value,
      minSubtotal: parsed.data.minSubtotal,
      maxUses: parsed.data.maxUses,
      expiresAt: parsed.data.expiresAt,
    },
  });
  revalidatePath("/admin/cupones");
  return { ok: true };
}

export async function setCouponActive(id: string, active: boolean) {
  if (!(await requireSession())) return { error: "No autorizado" };
  await prisma.coupon.update({ where: { id }, data: { active } });
  revalidatePath("/admin/cupones");
  return { ok: true };
}

export async function deleteCoupon(id: string) {
  if (!(await requireSession())) return { error: "No autorizado" };
  await prisma.coupon.delete({ where: { id } });
  revalidatePath("/admin/cupones");
  return { ok: true };
}
