import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/storefront";

export default function ExitoPage() {
  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <div className="bg-sage text-cream mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl">
          ✓
        </div>
        <h1 className="font-display text-ink mt-6 text-3xl">¡Gracias por tu compra!</h1>
        <p className="text-muted mt-3">
          Recibimos tu pago. Te enviamos un email con los detalles del pedido.
        </p>
        <Link
          href="/tienda"
          className="bg-sage text-cream mt-8 inline-block rounded-full px-6 py-3 text-sm"
        >
          Seguir comprando
        </Link>
      </div>
      <SiteFooter />
    </>
  );
}
