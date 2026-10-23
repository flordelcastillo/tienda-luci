import { prisma } from "@/lib/prisma";
import { CategoriesAdmin } from "./CategoriesAdmin";

export const dynamic = "force-dynamic";

export default async function CategoriasPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ position: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <h1 className="font-display text-ink text-3xl">Categorías</h1>
      <p className="text-muted mt-1 max-w-xl text-sm">
        Son las tarjetas de la home y los botones de la tienda. Podés cambiarles la foto,
        el nombre y el orden, o esconderlas de la home. Si no les ponés foto, se usa la
        del último producto de la categoría.
      </p>
      <CategoriesAdmin
        initial={categories.map((c) => ({
          id: c.id,
          slug: c.slug,
          name: c.name,
          image: c.image,
          showOnHome: c.showOnHome,
          position: c.position,
          products: c._count.products,
        }))}
      />
    </div>
  );
}
