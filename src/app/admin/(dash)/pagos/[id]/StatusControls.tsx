"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui";
import { updateOrderStatus } from "../actions";
import type { OrderStatus } from "@/generated/prisma/enums";

const ACTIONS: {
  status: OrderStatus;
  label: string;
  variant: "primary" | "gold" | "outline" | "danger";
}[] = [
  { status: "PAID", label: "Marcar pagado", variant: "primary" },
  { status: "FULFILLED", label: "Marcar enviado", variant: "gold" },
  { status: "CANCELLED", label: "Cancelar", variant: "danger" },
  { status: "REFUNDED", label: "Reembolsar", variant: "outline" },
];

export function StatusControls({
  orderId,
  current,
}: {
  orderId: string;
  current: OrderStatus;
}) {
  const [pending, start] = useTransition();

  function set(status: OrderStatus) {
    start(() => {
      updateOrderStatus(orderId, status);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {ACTIONS.map((a) => (
        <Button
          key={a.status}
          variant={a.variant}
          disabled={pending || current === a.status}
          onClick={() => set(a.status)}
        >
          {a.label}
        </Button>
      ))}
    </div>
  );
}
