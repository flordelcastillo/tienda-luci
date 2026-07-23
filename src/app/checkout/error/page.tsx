import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/storefront";

export default function ErrorPage() {
  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl text-red-600">
          ✕
        </div>
        <h1 className="font-display text-ink mt-6 text-3xl">El pago no se completó</h1>
        <p className="text-muted mt-3">
          Podés intentar nuevamente. No se realizó ningún cargo.
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
