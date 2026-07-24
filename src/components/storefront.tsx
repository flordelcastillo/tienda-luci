import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { getCartCount } from "@/lib/cart-server";

export async function SiteHeader() {
  const count = await getCartCount();

  return (
    <header className="bg-cream/85 border-line sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-display text-sage text-2xl tracking-tight">
          Teia
        </Link>
        <nav className="text-ink hidden items-center gap-8 text-sm sm:flex">
          <Link href="/tienda" className="hover:text-sage">
            Tienda
          </Link>
          <Link href="/tienda?cat=collares" className="hover:text-sage">
            Collares
          </Link>
          <Link href="/tienda?cat=aros" className="hover:text-sage">
            Aros
          </Link>
          <Link href="/tienda?cat=anillos" className="hover:text-sage">
            Anillos
          </Link>
        </nav>
        <Link
          href="/carrito"
          aria-label={`Carrito${count > 0 ? ` (${count})` : ""}`}
          className="text-ink hover:bg-sand/60 relative inline-flex size-10 items-center justify-center rounded-full transition-colors"
        >
          <ShoppingBag className="size-5" />
          {count > 0 && (
            <span className="bg-sage text-cream absolute -top-0.5 -right-0.5 inline-flex min-w-5 items-center justify-center rounded-full px-1 text-xs">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-line mt-24 border-t bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-3">
        <div>
          <p className="font-display text-sage text-2xl">Teia</p>
          <p className="text-muted mt-2 max-w-xs text-sm">
            Accesorios en acero quirúrgico. Piezas delicadas que no se oxidan,
            pensadas para acompañarte todos los días.
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="text-ink font-medium">Tienda</p>
          <Link href="/tienda" className="text-muted hover:text-sage block">
            Todos los productos
          </Link>
          <Link href="/tienda?cat=anillos" className="text-muted hover:text-sage block">
            Anillos
          </Link>
          <Link href="/tienda?cat=collares" className="text-muted hover:text-sage block">
            Collares
          </Link>
        </div>
        <div className="space-y-2 text-sm">
          <p className="text-ink font-medium">Ayuda</p>
          <p className="text-muted">Envíos a todo el país</p>
          <p className="text-muted">Pagos con Mercado Pago</p>
          <Link href="/admin" className="text-muted hover:text-sage block">
            Acceso administración
          </Link>
        </div>
      </div>
      <div className="border-line text-muted border-t py-4 text-center text-xs">
        © {new Date().getFullYear()} Teia accesorios · Hecho con dedicación
      </div>
    </footer>
  );
}
