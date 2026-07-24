// Precios se guardan en centavos (Int). Helpers de formato ARS.

export function formatARS(cents: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

// Convierte un valor ingresado en pesos (ej "12.500,50", "12500,50" o "12500.5") a centavos.
// Heurística: con coma, la coma es decimal y el punto es miles. Sin coma, un punto
// solo es decimal cuando deja 1-2 dígitos detrás; si no (o hay varios), son miles.
export function pesosToCents(input: string | number): number {
  if (typeof input === "number") return Math.round(input * 100);

  let s = input.trim();
  if (!s) return 0;

  if (s.includes(",")) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (s.includes(".")) {
    const parts = s.split(".");
    const decimals = parts[parts.length - 1].length;
    // Varios puntos, o >2 dígitos detrás → separador de miles.
    if (parts.length > 2 || decimals > 2) s = parts.join("");
  }

  const value = parseFloat(s);
  return Number.isNaN(value) ? 0 : Math.round(value * 100);
}

export function centsToPesos(cents: number): string {
  return (cents / 100).toFixed(2);
}
