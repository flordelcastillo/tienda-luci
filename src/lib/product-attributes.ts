// Opciones de atributos de producto, compartidas por el admin, los filtros de la
// tienda y la ficha. Un solo lugar para agregar/renombrar valores.

export type Option = { value: string; label: string };

export const METAL_OPTIONS: Option[] = [
  { value: "plateado", label: "Plateado" },
  { value: "dorado", label: "Dorado" },
  { value: "oro-rosa", label: "Oro rosa" },
];

export const STONE_COLOR_OPTIONS: Option[] = [
  { value: "rosa", label: "Rosa" },
  { value: "cristal", label: "Cristal" },
  { value: "aurora", label: "Aurora boreal" },
  { value: "verde", label: "Verde" },
  { value: "negro", label: "Negro" },
];

// Tema para combos/sets ("dije + aros del mismo tema").
export const THEME_OPTIONS: Option[] = [
  { value: "corazon", label: "Corazón" },
  { value: "tulipan", label: "Tulipán" },
  { value: "mariposa", label: "Mariposa" },
  { value: "gatito", label: "Gatito" },
  { value: "nudo", label: "Nudo" },
];

function toLabelMap(opts: Option[]): Record<string, string> {
  return Object.fromEntries(opts.map((o) => [o.value, o.label]));
}

export const METAL_LABEL = toLabelMap(METAL_OPTIONS);
export const STONE_COLOR_LABEL = toLabelMap(STONE_COLOR_OPTIONS);
export const THEME_LABEL = toLabelMap(THEME_OPTIONS);

export function labelFor(map: Record<string, string>, value: string): string {
  return map[value] ?? value;
}
