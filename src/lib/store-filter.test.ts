import { describe, it, expect } from "vitest";
import { buildStoreWhere, buildStoreQuery } from "./store-filter";

describe("buildStoreWhere", () => {
  it("sin filtros solo trae productos activos", () => {
    expect(buildStoreWhere({})).toEqual({ active: true });
  });

  it("filtra por categoría", () => {
    expect(buildStoreWhere({ cat: "anillos" })).toEqual({
      active: true,
      category: { slug: "anillos" },
    });
  });

  it("busca por nombre sin distinguir mayúsculas y recorta espacios", () => {
    expect(buildStoreWhere({ q: "  Anillo  " })).toEqual({
      active: true,
      name: { contains: "Anillo", mode: "insensitive" },
    });
  });

  it("convierte el rango de precio de pesos a centavos", () => {
    expect(buildStoreWhere({ min: "1.000", max: "5.000" })).toEqual({
      active: true,
      basePrice: { gte: 100000, lte: 500000 },
    });
  });

  it("acepta solo mínimo o solo máximo", () => {
    expect(buildStoreWhere({ min: "1000" }).basePrice).toEqual({ gte: 100000 });
    expect(buildStoreWhere({ max: "1000" }).basePrice).toEqual({ lte: 100000 });
  });

  it("ignora filtros vacíos o con solo espacios", () => {
    expect(buildStoreWhere({ cat: "", q: "   ", min: "", max: "" })).toEqual({
      active: true,
    });
  });

  it("combina categoría, búsqueda y precio", () => {
    expect(buildStoreWhere({ cat: "aros", q: "oro", min: "2000" })).toEqual({
      active: true,
      category: { slug: "aros" },
      name: { contains: "oro", mode: "insensitive" },
      basePrice: { gte: 200000 },
    });
  });
});

describe("buildStoreQuery", () => {
  it("sin filtros devuelve la ruta limpia", () => {
    expect(buildStoreQuery({})).toBe("/tienda");
  });

  it("preserva los filtros actuales", () => {
    expect(buildStoreQuery({ q: "oro", cat: "aros" })).toBe("/tienda?cat=aros&q=oro");
  });

  it("aplica overrides sobre lo actual", () => {
    expect(buildStoreQuery({ q: "oro", cat: "aros" }, { cat: "anillos" })).toBe(
      "/tienda?cat=anillos&q=oro",
    );
  });

  it("un override vacío quita el parámetro", () => {
    expect(buildStoreQuery({ q: "oro", cat: "aros" }, { cat: "" })).toBe("/tienda?q=oro");
  });
});
