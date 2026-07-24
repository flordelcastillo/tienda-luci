import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SiteHeader, SiteFooter } from "@/components/storefront";
import { ProductGallery } from "@/components/ProductGallery";
import { Badge } from "@/components/ui";
import { buildProductMetadata } from "@/lib/product-meta";
import { BuyBox } from "./BuyBox";

export const dynamic = "force-dynamic";

// Trae solo lo necesario para armar los metadatos (nombre, descripción, portada).
async function getProduct(slug: string) {
  return prisma.product.findFirst({
    where: { slug, active: true },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: true,
      category: true,
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Producto no encontrado · Luci Joyas" };

  const meta = buildProductMetadata({
    name: product.name,
    description: product.description,
    material: product.material,
    gemstone: product.gemstone,
    category: product.category?.name,
    basePrice: product.basePrice,
    image: product.images[0]?.url,
  });

  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      images: meta.image ? [{ url: meta.image }] : undefined,
    },
  };
}

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Galería */}
          <ProductGallery
            name={product.name}
            images={product.images.map((img) => ({
              id: img.id,
              url: img.url,
              alt: img.alt,
            }))}
          />

          {/* Info + compra */}
          <div>
            {product.category && (
              <p className="text-gold-dark text-xs tracking-[0.2em] uppercase">
                {product.category.name}
              </p>
            )}
            <h1 className="font-display text-ink mt-2 text-4xl">{product.name}</h1>

            <div className="mt-3 flex gap-2">
              {product.material && <Badge tone="rose">{product.material}</Badge>}
              {product.gemstone && <Badge tone="gold">{product.gemstone}</Badge>}
            </div>

            {product.description && (
              <p className="text-muted mt-5 leading-relaxed">{product.description}</p>
            )}

            <div className="mt-8">
              <BuyBox
                productId={product.id}
                basePrice={product.basePrice}
                variants={product.variants.map((v) => ({
                  id: v.id,
                  name: v.name,
                  priceDelta: v.priceDelta,
                  stock: v.stock,
                }))}
              />
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
