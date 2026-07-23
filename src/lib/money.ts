// Precios se guardan en centavos (Int). Helpers de formato ARS.

export function formatARS(cents: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

// Convierte un valor ingresado en pesos (ej "12500,50" o "12500.5") a centavos.
export function pesosToCents(input: string | number): number {
  if (typeof input === "number") return Math.round(input * 100);
  const normalized = input.replace(/\./g, "").replace(",", ".").trim();
  const value = parseFloat(normalized);
  if (Number.isNaN(value)) return 0;
  return Math.round(value * 100);
}

export function centsToPesos(cents: number): string {
  return (cents / 100).toFixed(2);
}
