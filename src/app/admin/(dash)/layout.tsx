import Link from "next/link";
import {
  LayoutDashboard,
  Gem,
  Boxes,
  CreditCard,
  Star,
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
  { href: "/admin/pagos", label: "Pagos y pedidos", Icon: CreditCard, badgeKey: "pending" },
  { href: "/admin/resenas", label: "Reseñas", Icon: Star },
  { href: "/admin/ajustes", label: "Ajustes", Icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const settings = await getSettings();
  // Aviso de pedidos sin gestionar (badge en "Pagos y pedidos").
  const pendingOrders = await prisma.order.count({ where: { status: "PENDING" } });

  return (
    <div className="bg-cream flex min-h-screen">
      <aside className="border-line flex w-60 shrink-0 flex-col border-r bg-white">
        <div className="border-line border-b px-6 py-5">
          <p className="font-display text-sage text-2xl">{settings.brandName}</p>
          <p className="text-muted text-xs">Administración</p>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {nav.map(({ href, label, Icon, badgeKey }) => (
            <Link
              key={href}
              href={href}
              className="text-ink hover:bg-sand/50 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors"
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
        <div className="border-line border-t px-3 py-4">
          <div className="px-3 pb-2">
            <p className="text-ink text-sm font-medium">{session?.name}</p>
            <p className="text-muted truncate text-xs">{session?.email}</p>
          </div>
          <form action={logoutAction}>
            <button className="text-muted hover:bg-sand/50 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors">
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
              Cerrar sesión
            </button>
          </form>
          <Link
            href="/"
            className="text-muted hover:bg-sand/50 mt-1 flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors"
          >
            <Store className="h-4 w-4" strokeWidth={1.75} />
            Ver tienda
          </Link>
        </div>
      </aside>
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
