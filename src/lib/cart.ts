// Carrito de compras. Lógica pura (sin cookies ni Prisma) para poder testearla.
// El carrito se persiste como JSON en una cookie; acá vive el modelo y las
// operaciones sobre la lista de líneas.

export type CartLine = {
  productId: string;
  variantId: string;
  qty: number;
};

// Tope por línea para evitar cantidades absurdas en la cookie.
export const MAX_LINE_QTY = 20;

// Dos líneas son la misma si apuntan al mismo producto + variante.
function sameLine(a: CartLine, b: { productId: string; variantId: string }): boolean {
  return a.productId === b.productId && a.variantId === b.variantId;
}

function clampQty(qty: number): number {
  if (!Number.isFinite(qty)) return 1;
  return Math.min(MAX_LINE_QTY, Math.max(1, Math.floor(qty)));
}

// Parsea el contenido de la cookie a una lista de líneas válida y saneada.
// Tolerante: cualquier cosa inválida se descarta en vez de romper.
export function parseCart(raw?: string | null): CartLine[] {
  if (!raw) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];

  const out: CartLine[] = [];
  for (const item of data) {
    if (!item || typeof item !== "object") continue;
    const { productId, variantId, qty } = item as Record<string, unknown>;
    if (typeof productId !== "string" || !productId) continue;
    if (typeof variantId !== "string" || !variantId) continue;
    const line = { productId, variantId, qty: clampQty(Number(qty)) };
    // Colapsa duplicados sumando cantidades.
    const existing = out.find((l) => sameLine(l, line));
    if (existing) existing.qty = clampQty(existing.qty + line.qty);
    else out.push(line);
  }
  return out;
}

export function serializeCart(lines: CartLine[]): string {
  return JSON.stringify(lines);
}

// Agrega una línea (o suma la cantidad si ya existía ese producto+variante).
export function addLine(
  lines: CartLine[],
  add: { productId: string; variantId: string; qty?: number },
): CartLine[] {
  const qty = clampQty(add.qty ?? 1);
  const next = lines.map((l) => ({ ...l }));
  const existing = next.find((l) => sameLine(l, add));
  if (existing) existing.qty = clampQty(existing.qty + qty);
  else next.push({ productId: add.productId, variantId: add.variantId, qty });
  return next;
}

// Fija la cantidad de una línea. Si qty <= 0 la elimina.
export function setQty(
  lines: CartLine[],
  target: { productId: string; variantId: string },
  qty: number,
): CartLine[] {
  if (qty <= 0) return removeLine(lines, target);
  return lines.map((l) =>
    sameLine(l, target) ? { ...l, qty: clampQty(qty) } : { ...l },
  );
}

export function removeLine(
  lines: CartLine[],
  target: { productId: string; variantId: string },
): CartLine[] {
  return lines.filter((l) => !sameLine(l, target)).map((l) => ({ ...l }));
}

// Cantidad total de unidades (para el badge del header).
export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.qty, 0);
}

// ─────────────── Vista del carrito (líneas + totales) ───────────────

// Datos de producto que necesita el carrito para calcular precios/stock.
export type ProductForCart = {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  image?: string;
  variants: { id: string; name: string; priceDelta: number; stock: number }[];
};

export type CartItemView = {
  productId: string;
  variantId: string;
  name: string;
  variantName: string;
  slug: string;
  image?: string;
  unitPrice: number; // centavos
  qty: number;
  lineTotal: number; // centavos
  stock: number;
};

// Combina las líneas de la cookie con los datos actuales de los productos.
// Descarta líneas cuyo producto o variante ya no existan (cookie desactualizada)
// y acota la cantidad al stock disponible. Devuelve las líneas y el subtotal.
export function buildCartItems(
  lines: CartLine[],
  products: ProductForCart[],
): { items: CartItemView[]; subtotal: number } {
  const byId = new Map(products.map((p) => [p.id, p]));
  const items: CartItemView[] = [];

  for (const line of lines) {
    const product = byId.get(line.productId);
    if (!product) continue;
    const variant = product.variants.find((v) => v.id === line.variantId);
    if (!variant) continue;

    const qty = Math.min(line.qty, Math.max(0, variant.stock));
    if (qty <= 0) continue;

    const unitPrice = product.basePrice + variant.priceDelta;
    items.push({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      variantName: variant.name,
      slug: product.slug,
      image: product.image,
      unitPrice,
      qty,
      lineTotal: unitPrice * qty,
      stock: variant.stock,
    });
  }

  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  return { items, subtotal };
}
