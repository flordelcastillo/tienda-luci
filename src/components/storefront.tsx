import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="bg-cream/85 border-line sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-display text-sage text-2xl tracking-tight">
          Luci
        </Link>
        <nav className="text-ink hidden items-center gap-8 text-sm sm:flex">
          <Link href="/tienda" className="hover:text-sage">
            Tienda
          </Link>
          <Link href="/tienda?cat=anillos" className="hover:text-sage">
            Anillos
          </Link>
          <Link href="/tienda?cat=collares" className="hover:text-sage">
            Collares
          </Link>
          <Link href="/tienda?cat=aros" className="hover:text-sage">
            Aros
          </Link>
        </nav>
        <Link
          href="/tienda"
          className="bg-sage text-cream rounded-full px-4 py-2 text-sm transition-colors hover:bg-[#2f3c33]"
        >
          Comprar
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
          <p className="font-display text-sage text-2xl">Luci</p>
          <p className="text-muted mt-2 max-w-xs text-sm">
            Joyería artesanal. Piezas pensadas para acompañarte todos los días.
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
        © {new Date().getFullYear()} Luci Joyas · Hecho con dedicación
      </div>
    </footer>
  );
}
