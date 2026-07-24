import Link from "next/link";
import { CartLink } from "@/components/CartLink";
import { getSettings } from "@/lib/settings";

export async function SiteHeader() {
  const { brandName } = await getSettings();
  return (
    <header className="bg-cream/85 border-line sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-display text-sage text-2xl tracking-tight">
          {brandName}
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
        <div className="flex items-center gap-5">
          <CartLink />
          <Link
            href="/tienda"
            className="bg-sage text-cream rounded-full px-4 py-2 text-sm transition-colors hover:bg-[#2f3c33]"
          >
            Comprar
          </Link>
        </div>
      </div>
    </header>
  );
}

export async function SiteFooter() {
  const { brandName, footerText } = await getSettings();
  return (
    <footer className="border-line mt-24 border-t bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-3">
        <div>
          <p className="font-display text-sage text-2xl">{brandName}</p>
          <p className="text-muted mt-2 max-w-xs text-sm">{footerText}</p>
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
          <Link href="/guia-de-talles" className="text-muted hover:text-sage block">
            Guía de talles
          </Link>
          <p className="text-muted">Envíos a todo el país</p>
          <p className="text-muted">Pago por transferencia</p>
          <Link href="/admin" className="text-muted hover:text-sage block">
            Acceso administración
          </Link>
        </div>
      </div>
      <div className="border-line text-muted border-t py-4 text-center text-xs">
        © {new Date().getFullYear()} {brandName} · Hecho con dedicación
      </div>
    </footer>
  );
}
