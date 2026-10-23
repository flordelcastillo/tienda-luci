import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { CartLink } from "@/components/CartLink";
import { formatARS } from "@/lib/money";
import { getSettings } from "@/lib/settings";

// Barra superior que se desplaza. El contenido se repite dos veces para que el
// loop (-50%) no tenga salto.
async function AnnouncementBar() {
  const { announcement, freeShippingCents } = await getSettings();
  const items = [
    announcement,
    freeShippingCents > 0 ? `Envío gratis desde ${formatARS(freeShippingCents)}` : "",
    "Envíos a todo el país",
    "Pago por transferencia",
  ].filter(Boolean);

  return (
    <div className="bg-sage text-cream overflow-hidden py-2 text-xs sm:text-sm">
      <div className="marquee-track">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
            {items.map((text) => (
              <span key={text} className="px-6 whitespace-nowrap">
                {text}
                <span className="text-gold ml-12">•</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export async function SiteHeader() {
  const { brandName, whatsapp } = await getSettings();
  return (
    <>
      <AnnouncementBar />
      <header className="bg-cream/90 border-line sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto] items-center gap-4 px-6 md:grid-cols-[1fr_auto_1fr]">
          <Link href="/" className="shrink-0 justify-self-start">
            <Image
              src="/logo-teia.png"
              alt={brandName}
              width={407}
              height={213}
              priority
              className="h-12 w-auto"
            />
          </Link>
          <nav className="text-ink hidden items-center gap-8 text-sm md:flex">
            <Link href="/" className="hover:text-gold-dark">
              Inicio
            </Link>
            <Link href="/tienda" className="hover:text-gold-dark">
              Tienda
            </Link>
            <Link href="/guia-de-talles" className="hover:text-gold-dark">
              Guía de talles
            </Link>
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold-dark"
            >
              Contacto
            </a>
          </nav>
          <div className="flex items-center justify-self-end gap-5">
            <CartLink />
            <Link
              href="/tienda"
              className="bg-sage text-cream rounded-full px-4 py-2 text-sm transition-opacity hover:opacity-85"
            >
              Comprar
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}

export async function SiteFooter() {
  const { brandName, footerText, whatsapp } = await getSettings();
  return (
    <footer className="border-line bg-sand mt-24 border-t">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-3">
        <div>
          <Image
            src="/logo-teia.png"
            alt={brandName}
            width={407}
            height={213}
            className="h-16 w-auto"
          />
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

      {/* Botón flotante de WhatsApp */}
      <a
        href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("¡Hola! Quiero consultar por un producto.")}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escribinos por WhatsApp"
        className="fixed right-5 bottom-5 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
      >
        <MessageCircle className="size-7" />
      </a>
    </footer>
  );
}
