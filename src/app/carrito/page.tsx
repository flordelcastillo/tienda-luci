import { SiteHeader, SiteFooter } from "@/components/storefront";
import { getSettings } from "@/lib/settings";
import { CartView } from "./CartView";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tu carrito · Teia accesorios" };

export default async function CarritoPage() {
  const { whatsapp } = await getSettings();
  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display text-ink text-4xl">Tu carrito</h1>
        <CartView whatsappNumber={whatsapp} />
      </div>
      <SiteFooter />
    </>
  );
}
