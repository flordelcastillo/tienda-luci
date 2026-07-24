import { prisma } from "@/lib/prisma";
import { CouponsAdmin } from "./CouponsAdmin";

export const dynamic = "force-dynamic";

export default async function CuponesPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <h1 className="font-display text-ink text-3xl">Cupones</h1>
        <p className="text-muted mt-1 text-sm">
          Creá códigos de descuento para tus promos. Se aplican en el carrito antes de
          finalizar por WhatsApp.
        </p>
      </header>

      <CouponsAdmin
        coupons={coupons.map((c) => ({
          id: c.id,
          code: c.code,
          kind: c.kind,
          value: c.value,
          minSubtotal: c.minSubtotal,
          maxUses: c.maxUses,
          usedCount: c.usedCount,
          active: c.active,
          expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
        }))}
      />
    </div>
  );
}
