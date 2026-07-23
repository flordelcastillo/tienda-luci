import { Badge } from "@/components/ui";

export const ORDER_LABELS: Record<
  string,
  { tone: "gold" | "sage" | "gray" | "red" | "rose"; label: string }
> = {
  PENDING: { tone: "gold", label: "Pendiente" },
  PAID: { tone: "sage", label: "Pagado" },
  FULFILLED: { tone: "sage", label: "Enviado" },
  CANCELLED: { tone: "red", label: "Cancelado" },
  REFUNDED: { tone: "gray", label: "Reembolsado" },
};

export const PAYMENT_LABELS: Record<
  string,
  { tone: "gold" | "sage" | "gray" | "red"; label: string }
> = {
  PENDING: { tone: "gold", label: "Pendiente" },
  APPROVED: { tone: "sage", label: "Aprobado" },
  REJECTED: { tone: "red", label: "Rechazado" },
  REFUNDED: { tone: "gray", label: "Reembolsado" },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const s = ORDER_LABELS[status] ?? { tone: "gray" as const, label: status };
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: string }) {
  const s = PAYMENT_LABELS[status] ?? { tone: "gray" as const, label: status };
  return <Badge tone={s.tone}>{s.label}</Badge>;
}
