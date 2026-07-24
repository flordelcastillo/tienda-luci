"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Select } from "@/components/ui";
import { updateOrderStatus } from "./actions";
import { ORDER_LABELS } from "./StatusBadge";
import type { OrderStatus } from "@/generated/prisma/enums";

const OPTIONS: OrderStatus[] = [
  "PENDING",
  "PAID",
  "FULFILLED",
  "CANCELLED",
  "REFUNDED",
];

// Cambio de estado directo desde la lista de pedidos, sin entrar al detalle.
export function RowStatus({
  orderId,
  current,
}: {
  orderId: string;
  current: OrderStatus;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();

  function onChange(status: OrderStatus) {
    if (status === current) return;
    // Al cancelar o reembolsar, preguntar si se devuelve el stock al inventario.
    let restore: boolean | undefined;
    if (status === "CANCELLED" || status === "REFUNDED") {
      restore = window.confirm(
        "¿Devolver el stock de este pedido al inventario?\n\nAceptar = sí, sumar de nuevo.\nCancelar = no, dejarlo descontado.",
      );
    }
    start(async () => {
      const res = await updateOrderStatus(orderId, status, restore);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(`Pedido marcado como ${ORDER_LABELS[status]?.label ?? status}`);
        router.refresh();
      }
    });
  }

  return (
    <Select
      value={current}
      disabled={pending}
      onChange={(e) => onChange(e.target.value as OrderStatus)}
      className="w-36 py-1.5 text-sm"
      aria-label="Cambiar estado del pedido"
    >
      {OPTIONS.map((s) => (
        <option key={s} value={s}>
          {ORDER_LABELS[s]?.label ?? s}
        </option>
      ))}
    </Select>
  );
}
