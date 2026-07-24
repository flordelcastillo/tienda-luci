import { describe, it, expect } from "vitest";
import {
  buildStoreWhere,
  buildStoreQuery,
  buildStoreOrderBy,
} from "./store-filter";

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

describe("buildStoreOrderBy", () => {
  it("sin valor ordena por más nuevos", () => {
    expect(buildStoreOrderBy()).toEqual({ createdAt: "desc" });
  });

  it("valor desconocido cae en el default", () => {
    expect(buildStoreOrderBy("cualquiera")).toEqual({ createdAt: "desc" });
  });

  it("ordena por precio ascendente y descendente", () => {
    expect(buildStoreOrderBy("precio-asc")).toEqual({ basePrice: "asc" });
    expect(buildStoreOrderBy("precio-desc")).toEqual({ basePrice: "desc" });
  });

  it("ordena por nombre A-Z", () => {
    expect(buildStoreOrderBy("nombre")).toEqual({ name: "asc" });
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

  it("agrega el orden cuando no es el default", () => {
    expect(buildStoreQuery({ sort: "precio-asc" })).toBe("/tienda?sort=precio-asc");
  });

  it("omite el orden por defecto para mantener la URL limpia", () => {
    expect(buildStoreQuery({ sort: "nuevos" })).toBe("/tienda");
    expect(buildStoreQuery({ q: "oro", sort: "nuevos" })).toBe("/tienda?q=oro");
  });

  it("preserva el orden junto con otros filtros", () => {
    expect(buildStoreQuery({ cat: "aros", sort: "precio-desc" })).toBe(
      "/tienda?cat=aros&sort=precio-desc",
    );
  });
});
