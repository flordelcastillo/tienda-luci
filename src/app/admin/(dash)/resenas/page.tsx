import { prisma } from "@/lib/prisma";
import { ReviewsAdmin } from "./ReviewsAdmin";

export const dynamic = "force-dynamic";

export default async function ResenasPage() {
  const [reviews, products] = await Promise.all([
    prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      include: { product: { select: { name: true } } },
    }),
    prisma.product.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <h1 className="font-display text-ink text-3xl">Reseñas</h1>
        <p className="text-muted mt-1 text-sm">
          Cargá reseñas de tus clientas y elegí cuáles se muestran en la tienda.
        </p>
      </header>

      <ReviewsAdmin
        products={products}
        reviews={reviews.map((r) => ({
          id: r.id,
          author: r.author,
          rating: r.rating,
          text: r.text,
          approved: r.approved,
          createdAt: r.createdAt.toISOString(),
          productName: r.product.name,
        }))}
      />
    </div>
  );
}
