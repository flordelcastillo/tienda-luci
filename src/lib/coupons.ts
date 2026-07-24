// Cupones de descuento. Lógica pura (sin Prisma) para poder testearla: validación
// y cálculo del descuento. El código se guarda y compara en MAYÚSCULAS.

// Forma mínima del cupón que necesita el cálculo (subconjunto del modelo Prisma).
export type CouponData = {
  code: string;
  kind: string; // "percent" | "fixed"
  value: number; // percent: 1..100 · fixed: centavos
  minSubtotal: number;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
  expiresAt: Date | null;
};

/** Normaliza un código tipeado por el cliente para buscarlo/guardarlo. */
export function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

/**
 * Valida un cupón contra el subtotal actual. Devuelve un mensaje de error para
 * mostrar, o null si es aplicable. `now` es inyectable para testear vencimientos.
 */
export function couponError(
  coupon: CouponData,
  subtotal: number,
  now: Date = new Date(),
): string | null {
  if (!coupon.active) return "Este cupón no está disponible.";
  if (coupon.expiresAt && coupon.expiresAt.getTime() < now.getTime())
    return "Este cupón está vencido.";
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses)
    return "Este cupón ya alcanzó su límite de usos.";
  if (subtotal < coupon.minSubtotal) return "Tu pedido no llega al mínimo del cupón.";
  return null;
}

/**
 * Descuento en centavos que aplica el cupón sobre el subtotal. Nunca supera el
 * subtotal (no deja el total en negativo). No valida: usar junto a couponError.
 */
export function computeDiscount(coupon: CouponData, subtotal: number): number {
  const raw =
    coupon.kind === "percent"
      ? Math.round((subtotal * coupon.value) / 100)
      : coupon.value;
  return Math.max(0, Math.min(raw, subtotal));
}

/** Etiqueta corta del descuento para mostrar (ej "10%" o "$500"). */
export function couponSummary(coupon: Pick<CouponData, "kind" | "value">): string {
  return coupon.kind === "percent"
    ? `${coupon.value}%`
    : new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
      }).format(coupon.value / 100);
}
