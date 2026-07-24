// Zonas de entrega que ofrece Teia. Se usa en el carrito, la orden y el admin.
export const DELIVERY_OPTIONS = [
  { value: "villa-mercedes", label: "Envío en Villa Mercedes" },
  { value: "rio-cuarto", label: "Envío en Río Cuarto" },
  { value: "encuentro", label: "Retiro en punto de encuentro" },
] as const;

export type DeliveryZone = (typeof DELIVERY_OPTIONS)[number]["value"];

export const DELIVERY_VALUES = DELIVERY_OPTIONS.map((o) => o.value) as string[];

const LABELS = Object.fromEntries(DELIVERY_OPTIONS.map((o) => [o.value, o.label]));

/** Etiqueta legible de una zona; "—" si está vacía o no reconocida. */
export function deliveryLabel(value: string): string {
  return LABELS[value] ?? (value ? value : "—");
}

/** Indica si la zona requiere dirección de envío (el punto de encuentro no). */
export function needsAddress(value: string): boolean {
  return value === "villa-mercedes" || value === "rio-cuarto";
}
