"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartCount } from "@/lib/cart";

export function CartLink() {
  const count = useCartCount();
  return (
    <Link
      href="/carrito"
      aria-label={`Carrito${count > 0 ? ` (${count})` : ""}`}
      className="text-ink hover:text-sage relative inline-flex items-center transition-colors"
    >
      <ShoppingBag className="size-5" />
      {count > 0 && (
        <span className="bg-sage text-cream absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium">
          {count}
        </span>
      )}
    </Link>
  );
}
