import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/storefront";

export default function PendientePage() {
  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <div className="bg-gold/20 text-gold-dark mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl">
          ⏳
        </div>
        <h1 className="font-display text-ink mt-6 text-3xl">Pago pendiente</h1>
        <p className="text-muted mt-3">
          Tu pago está siendo procesado. Te avisaremos por email cuando se confirme.
        </p>
        <Link
          href="/tienda"
          className="bg-sage text-cream mt-8 inline-block rounded-full px-6 py-3 text-sm"
        >
          Volver a la tienda
        </Link>
      </div>
      <SiteFooter />
    </>
  );
}
