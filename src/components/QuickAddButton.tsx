"use client";

import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
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

// Botón "Agregar" de la tarjeta de producto. Si el producto tiene varias
// variantes, manda a la ficha para que elija.
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
      aria-label={item.multiVariant ? undefined : "Agregar al carrito"}
      className="bg-sage text-cream inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs transition-opacity hover:opacity-85"
    >
      {item.multiVariant ? "Ver opciones" : "Agregar"}
      <ShoppingBag className="size-3.5" />
    </button>
  );
}
