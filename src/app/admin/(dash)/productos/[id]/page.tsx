import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { centsToPesos } from "@/lib/money";
import { ProductForm, ProductInitial } from "../ProductForm";
import { updateProduct } from "../actions";
import { DeleteProductButton } from "./DeleteButton";

export const dynamic = "force-dynamic";

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { position: "asc" } },
        variants: true,
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  const initial: ProductInitial = {
    id: product.id,
    name: product.name,
    description: product.description,
    material: product.material,
    gemstone: product.gemstone,
    basePrice: centsToPesos(product.basePrice),
    compareAtPrice: product.compareAtPrice ? centsToPesos(product.compareAtPrice) : "",
    categoryId: product.categoryId ?? "",
    active: product.active,
    featured: product.featured,
    metal: product.metal,
    stoneColor: product.stoneColor,
    theme: product.theme,
    waterproof: product.waterproof,
    hypoallergenic: product.hypoallergenic,
    giftIdea: product.giftIdea,
    giftWrap: product.giftWrap,
    measurements: product.measurements,
    audience: product.audience,
    images: product.images.map((img) => ({ url: img.url, alt: img.alt })),
    variants: product.variants.map((v) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      priceDelta: centsToPesos(v.priceDelta),
      stock: String(v.stock),
    })),
  };

  async function action(formData: FormData) {
    "use server";
    return updateProduct(id, null, formData);
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-ink text-3xl">Editar producto</h1>
          <p className="text-muted mt-1 text-sm">{product.name}</p>
        </div>
        <DeleteProductButton id={product.id} />
      </header>
      <ProductForm categories={categories} initial={initial} action={action} />
    </div>
  );
}
