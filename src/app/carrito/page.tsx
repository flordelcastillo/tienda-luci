import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SiteHeader, SiteFooter } from "@/components/storefront";
import { LinkButton } from "@/components/ui";
import { formatARS } from "@/lib/money";
import { buildCartItems, type ProductForCart } from "@/lib/cart";
import { getCartLines } from "@/lib/cart-server";
import { updateQtyAction, removeFromCartAction } from "./actions";
import { CartCheckout } from "./CartCheckout";

export const dynamic = "force-dynamic";

export const metadata = { title: "Tu carrito · Teia accesorios" };

export default async function CarritoPage() {
  const lines = await getCartLines();

  const products = lines.length
    ? await prisma.product.findMany({
        where: { id: { in: lines.map((l) => l.productId) }, active: true },
        include: {
          variants: true,
          images: { orderBy: { position: "asc" }, take: 1 },
        },
      })
    : [];

  const forCart: ProductForCart[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    basePrice: p.basePrice,
    image: p.images[0]?.url,
    variants: p.variants,
  }));

  const { items, subtotal } = buildCartItems(lines, forCart);

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="font-display text-ink text-4xl">Tu carrito</h1>

        {items.length === 0 ? (
          <div className="text-muted flex flex-col items-center gap-4 py-20 text-center">
            <ShoppingBag className="size-10 opacity-40" />
            <p>Tu carrito está vacío.</p>
            <LinkButton href="/tienda" variant="outline">
              Ir a la tienda
            </LinkButton>
          </div>
        ) : (
          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_20rem]">
            {/* Líneas */}
            <ul className="divide-line divide-y">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.variantId}`}
                  className="flex gap-4 py-5"
                >
                  <Link
                    href={`/producto/${item.slug}`}
                    className="bg-sand size-24 shrink-0 overflow-hidden rounded-xl"
                  >
                    {item.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-4">
                      <div>
                        <Link
                          href={`/producto/${item.slug}`}
                          className="text-ink hover:text-sage"
                        >
                          {item.name}
                        </Link>
                        <p className="text-muted text-sm">{item.variantName}</p>
                      </div>
                      <p className="font-display text-sage whitespace-nowrap">
                        {formatARS(item.lineTotal)}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center gap-3 pt-3">
                      {/* Cantidad: cada botón es un form con server action (funciona sin JS) */}
                      <div className="border-line flex items-center rounded-full border">
                        <form action={updateQtyAction}>
                          <input type="hidden" name="productId" value={item.productId} />
                          <input type="hidden" name="variantId" value={item.variantId} />
                          <input type="hidden" name="qty" value={item.qty - 1} />
                          <button
                            type="submit"
                            aria-label="Restar uno"
                            className="text-ink flex h-9 w-9 items-center justify-center"
                          >
                            <Minus className="size-4" />
                          </button>
                        </form>
                        <span className="w-8 text-center text-sm" aria-label="Cantidad">
                          {item.qty}
                        </span>
                        <form action={updateQtyAction}>
                          <input type="hidden" name="productId" value={item.productId} />
                          <input type="hidden" name="variantId" value={item.variantId} />
                          <input type="hidden" name="qty" value={item.qty + 1} />
                          <button
                            type="submit"
                            aria-label="Sumar uno"
                            disabled={item.qty >= item.stock}
                            className="text-ink flex h-9 w-9 items-center justify-center disabled:opacity-30"
                          >
                            <Plus className="size-4" />
                          </button>
                        </form>
                      </div>

                      <form action={removeFromCartAction}>
                        <input type="hidden" name="productId" value={item.productId} />
                        <input type="hidden" name="variantId" value={item.variantId} />
                        <button
                          type="submit"
                          className="text-muted hover:text-red-600 inline-flex items-center gap-1 text-sm"
                        >
                          <Trash2 className="size-4" />
                          Quitar
                        </button>
                      </form>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Resumen + checkout */}
            <aside className="border-line h-fit rounded-[var(--radius-card)] border bg-white p-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="text-ink">{formatARS(subtotal)}</span>
              </div>
              <div className="border-line mt-4 flex justify-between border-t pt-4">
                <span className="text-ink font-medium">Total</span>
                <span className="font-display text-sage text-xl">
                  {formatARS(subtotal)}
                </span>
              </div>
              <div className="mt-6">
                <CartCheckout
                  items={items.map((i) => ({
                    productId: i.productId,
                    variantId: i.variantId,
                    quantity: i.qty,
                  }))}
                  total={subtotal}
                />
              </div>
              <Link
                href="/tienda"
                className="text-muted hover:text-sage mt-4 block text-center text-sm"
              >
                Seguir comprando
              </Link>
            </aside>
          </div>
        )}
      </div>
      <SiteFooter />
    </>
  );
}
