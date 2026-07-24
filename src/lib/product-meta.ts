import { formatARS } from "./money";

// Datos mínimos de un producto para armar los metadatos de la página de detalle.
export type ProductMetaInput = {
  name: string;
  description?: string;
  material?: string;
  gemstone?: string;
  category?: string | null;
  basePrice: number; // en centavos
  image?: string;
};

export type ProductMeta = {
  title: string;
  description: string;
  image?: string;
};

const SITE = "Teia accesorios";
const MAX_DESC = 160; // límite recomendado para meta description

// Construye título y descripción SEO para un producto. Función pura: no toca
// Prisma ni Next, así se testea sola. La descripción cae en un texto derivado
// del material/piedra/precio cuando el producto no trae una propia.
export function buildProductMetadata(p: ProductMetaInput): ProductMeta {
  const title = `${p.name} · ${SITE}`;

  const own = p.description?.trim();
  const description = own ? truncate(own, MAX_DESC) : fallbackDescription(p);

  return { title, description, image: p.image };
}

function fallbackDescription(p: ProductMetaInput): string {
  const detalles = [p.material?.trim(), p.gemstone?.trim()].filter(Boolean);
  const base = detalles.length ? `${p.name} en ${detalles.join(" con ")}.` : `${p.name}.`;
  return truncate(`${base} ${formatARS(p.basePrice)} — ${SITE}.`, MAX_DESC);
}

function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}
