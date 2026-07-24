"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { addToCart } from "@/lib/cart";

export type QuickAdd = {
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  variantName: string; // "" si es variante única
  unitPrice: number;
  image: string;
  multiVariant: boolean; // si tiene varias variantes reales
};

// Botón de "agregar al carrito" directo desde la grilla de la tienda. Si el
// producto tiene varias variantes, mejor mandar a la ficha para que elija.
export function QuickAddButton({ item }: { item: QuickAdd }) {
  const router = useRouter();

  function onClick(e: React.MouseEvent) {
    e.preventDefault(); // no seguir el link de la tarjeta
    e.stopPropagation();

    if (item.multiVariant) {
      router.push(`/producto/${item.slug}`);
      return;
    }
    addToCart({
      productId: item.productId,
      variantId: item.variantId,
      slug: item.slug,
      name: item.name,
      variantName: item.variantName,
      unitPrice: item.unitPrice,
      image: item.image,
      gift: false,
      qty: 1,
    });
    toast.success("Agregado al carrito", {
      description: item.name,
      action: { label: "Ver carrito", onClick: () => router.push("/carrito") },
    });
  }

  return (
    <button
      onClick={onClick}
      aria-label="Agregar al carrito"
      title={item.multiVariant ? "Elegí la variante" : "Agregar al carrito"}
      className="bg-sage text-cream absolute right-3 bottom-3 flex size-9 items-center justify-center rounded-full opacity-0 shadow-md transition-all group-hover:opacity-100 hover:bg-[#2f3c33]"
    >
      <Plus className="size-5" />
    </button>
  );
}
