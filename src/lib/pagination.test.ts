import { describe, it, expect } from "vitest";
import { parsePage, buildPagination } from "./pagination";

describe("parsePage", () => {
  it("sin valor devuelve 1", () => {
    expect(parsePage()).toBe(1);
    expect(parsePage("")).toBe(1);
    expect(parsePage("   ")).toBe(1);
  });

  it("parsea enteros válidos", () => {
    expect(parsePage("3")).toBe(3);
    expect(parsePage(" 12 ")).toBe(12);
  });

  it("valores inválidos o menores a 1 caen en 1", () => {
    expect(parsePage("0")).toBe(1);
    expect(parsePage("-5")).toBe(1);
    expect(parsePage("abc")).toBe(1);
    expect(parsePage("1.9")).toBe(1); // parseInt corta en 1, sigue válido
  });
});

describe("buildPagination", () => {
  it("una sola página cuando hay pocos ítems", () => {
    const p = buildPagination(5, 1, 8);
    expect(p.totalPages).toBe(1);
    expect(p.skip).toBe(0);
    expect(p.take).toBe(8);
    expect(p.hasPrev).toBe(false);
    expect(p.hasNext).toBe(false);
  });

  it("calcula el total de páginas redondeando hacia arriba", () => {
    expect(buildPagination(9, 1, 8).totalPages).toBe(2);
    expect(buildPagination(16, 1, 8).totalPages).toBe(2);
    expect(buildPagination(17, 1, 8).totalPages).toBe(3);
  });

  it("calcula skip/take según la página", () => {
    const p2 = buildPagination(20, 2, 8);
    expect(p2.skip).toBe(8);
    expect(p2.take).toBe(8);
    expect(p2.hasPrev).toBe(true);
    expect(p2.hasNext).toBe(true);
  });

  it("acota una página mayor al total a la última", () => {
    const p = buildPagination(10, 99, 8);
    expect(p.page).toBe(2);
    expect(p.skip).toBe(8);
    expect(p.hasNext).toBe(false);
  });

  it("acota una página menor a 1", () => {
    const p = buildPagination(10, 0, 8);
    expect(p.page).toBe(1);
    expect(p.skip).toBe(0);
  });

  it("con cero ítems hay una página vacía", () => {
    const p = buildPagination(0, 1, 8);
    expect(p.totalPages).toBe(1);
    expect(p.totalItems).toBe(0);
    expect(p.hasPrev).toBe(false);
    expect(p.hasNext).toBe(false);
  });

  it("usa PAGE_SIZE por defecto", () => {
    expect(buildPagination(9, 1).totalPages).toBe(2);
  });
});
