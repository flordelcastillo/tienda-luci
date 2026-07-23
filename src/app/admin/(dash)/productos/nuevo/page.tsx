import { prisma } from "@/lib/prisma";
import { ProductForm } from "../ProductForm";
import { createProduct } from "../actions";

export const dynamic = "force-dynamic";

export default async function NuevoProductoPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  async function action(formData: FormData) {
    "use server";
    return createProduct(null, formData);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-ink text-3xl">Nuevo producto</h1>
        <p className="text-muted mt-1 text-sm">Cargá una nueva pieza a la tienda</p>
      </header>
      <ProductForm categories={categories} action={action} />
    </div>
  );
}
