import Link from "next/link";
import {
  LayoutDashboard,
  Gem,
  Boxes,
  CreditCard,
  Star,
  Ticket,
  Tags,
  Settings,
  LogOut,
  Store,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { logoutAction } from "../actions";

const nav = [
  { href: "/admin", label: "Panel", Icon: LayoutDashboard },
  { href: "/admin/productos", label: "Productos", Icon: Gem },
  { href: "/admin/inventario", label: "Inventario", Icon: Boxes },
  {
    href: "/admin/pagos",
    label: "Pagos y pedidos",
    Icon: CreditCard,
    badgeKey: "pending",
  },
  { href: "/admin/resenas", label: "Reseñas", Icon: Star },
  { href: "/admin/categorias", label: "Categorías", Icon: Tags },
  { href: "/admin/cupones", label: "Cupones", Icon: Ticket },
  { href: "/admin/ajustes", label: "Ajustes", Icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const settings = await getSettings();
  // Aviso de pedidos sin gestionar (badge en "Pagos y pedidos").
  const pendingOrders = await prisma.order.count({ where: { status: "PENDING" } });

  return (
    <div className="bg-cream flex min-h-screen flex-col md:flex-row">
      <aside className="border-line flex w-full shrink-0 flex-col border-b bg-white md:w-60 md:border-r md:border-b-0">
        <div className="border-line flex items-baseline gap-3 border-b px-4 py-3 md:block md:px-6 md:py-5">
          <p className="font-display text-sage text-2xl">{settings.brandName}</p>
          <p className="text-muted text-xs">Administración</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 py-2 md:block md:flex-1 md:space-y-1 md:overflow-visible md:py-4">
          {nav.map(({ href, label, Icon, badgeKey }) => (
            <Link
              key={href}
              href={href}
              className="text-ink hover:bg-sand/50 flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm whitespace-nowrap transition-colors md:gap-3"
            >
              <Icon className="text-sage h-4 w-4" strokeWidth={1.75} />
              {label}
              {badgeKey === "pending" && pendingOrders > 0 && (
                <span className="bg-gold text-ink ml-auto rounded-full px-2 py-0.5 text-xs font-medium">
                  {pendingOrders}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="border-line flex items-center gap-1 border-t px-3 py-2 md:block md:py-4">
          <div className="hidden px-3 pb-2 md:block">
            <p className="text-ink text-sm font-medium">{session?.name}</p>
            <p className="text-muted truncate text-xs">{session?.email}</p>
          </div>
          <form action={logoutAction} className="md:contents">
            <button className="text-muted hover:bg-sand/50 flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors md:w-full md:gap-3">
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
              Cerrar sesión
            </button>
          </form>
          <Link
            href="/"
            className="text-muted hover:bg-sand/50 flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors md:mt-1 md:gap-3"
          >
            <Store className="h-4 w-4" strokeWidth={1.75} />
            Ver tienda
          </Link>
        </div>
      </aside>
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">{children}</div>
      </main>
    </div>
  );
}
