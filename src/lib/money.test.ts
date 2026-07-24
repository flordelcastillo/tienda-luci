import { describe, it, expect } from "vitest";
import { formatARS, pesosToCents, centsToPesos } from "./money";

describe("pesosToCents", () => {
  it("convierte números a centavos", () => {
    expect(pesosToCents(125)).toBe(12500);
    expect(pesosToCents(125.5)).toBe(12550);
  });

  it("parsea formato es-AR con miles y coma decimal", () => {
    expect(pesosToCents("12.500,50")).toBe(1250050);
    expect(pesosToCents("1.000")).toBe(100000);
  });

  // OJO: el punto se trata SIEMPRE como separador de miles (se elimina),
  // así que un punto decimal solo no se interpreta como decimal.
  // El comentario de money.ts sugiere lo contrario → discrepancia conocida.
  it("trata el punto como separador de miles", () => {
    expect(pesosToCents("12500.5")).toBe(12500500);
  });

  it("devuelve 0 ante entrada inválida", () => {
    expect(pesosToCents("abc")).toBe(0);
    expect(pesosToCents("")).toBe(0);
  });
});

describe("centsToPesos", () => {
  it("devuelve string con dos decimales", () => {
    expect(centsToPesos(12550)).toBe("125.50");
    expect(centsToPesos(100000)).toBe("1000.00");
  });
});

describe("formatARS", () => {
  it("formatea centavos como moneda ARS sin decimales", () => {
    const out = formatARS(1250000);
    expect(out).toContain("12.500");
    expect(out).toContain("$");
  });
});
