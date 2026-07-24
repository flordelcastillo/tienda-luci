import { describe, it, expect } from "vitest";
import {
  normalizeCode,
  couponError,
  computeDiscount,
  couponSummary,
  type CouponData,
} from "./coupons";

const base: CouponData = {
  code: "TEIA10",
  kind: "percent",
  value: 10,
  minSubtotal: 0,
  maxUses: null,
  usedCount: 0,
  active: true,
  expiresAt: null,
};

describe("normalizeCode", () => {
  it("recorta y pasa a mayúsculas", () => {
    expect(normalizeCode("  teia10 ")).toBe("TEIA10");
  });
});

describe("couponError", () => {
  it("acepta un cupón válido", () => {
    expect(couponError(base, 500000)).toBeNull();
  });
  it("rechaza inactivo", () => {
    expect(couponError({ ...base, active: false }, 500000)).toMatch(/no está disponible/);
  });
  it("rechaza vencido", () => {
    const c = { ...base, expiresAt: new Date("2020-01-01") };
    expect(couponError(c, 500000, new Date("2026-01-01"))).toMatch(/vencido/);
  });
  it("rechaza si superó el máximo de usos", () => {
    expect(couponError({ ...base, maxUses: 5, usedCount: 5 }, 500000)).toMatch(/límite/);
  });
  it("rechaza si no llega al mínimo", () => {
    expect(couponError({ ...base, minSubtotal: 800000 }, 500000)).toMatch(/mínimo/);
  });
});

describe("computeDiscount", () => {
  it("porcentaje", () => {
    expect(computeDiscount(base, 500000)).toBe(50000);
  });
  it("monto fijo", () => {
    expect(computeDiscount({ ...base, kind: "fixed", value: 30000 }, 500000)).toBe(30000);
  });
  it("nunca supera el subtotal", () => {
    expect(computeDiscount({ ...base, kind: "fixed", value: 999999 }, 500000)).toBe(500000);
  });
});

describe("couponSummary", () => {
  it("porcentaje y fijo", () => {
    expect(couponSummary(base)).toBe("10%");
    expect(couponSummary({ kind: "fixed", value: 50000 })).toContain("500");
  });
});
