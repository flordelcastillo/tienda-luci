// Integración con Mercado Pago (Checkout Pro).
// Documentación: https://www.mercadopago.com.ar/developers

const MP_API = "https://api.mercadopago.com";

type PreferenceItem = {
  title: string;
  quantity: number;
  unit_price: number; // en pesos (no centavos)
  currency_id: "ARS";
};

export type CreatePreferenceInput = {
  orderId: string;
  orderNumber: number;
  items: PreferenceItem[];
  payer: { name: string; email: string };
};

// Crea una preferencia de pago y devuelve el init_point (URL de checkout).
export async function createPreference(input: CreatePreferenceInput) {
  const token = process.env.MP_ACCESS_TOKEN;
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  if (!token) {
    // Modo demo: sin credenciales devolvemos una URL simulada para no romper el flujo.
    return {
      preferenceId: `demo-${input.orderId}`,
      initPoint: `${site}/checkout/demo?order=${input.orderId}`,
      demo: true,
    };
  }

  const res = await fetch(`${MP_API}/checkout/preferences`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      items: input.items,
      payer: { name: input.payer.name, email: input.payer.email },
      external_reference: input.orderId,
      back_urls: {
        success: `${site}/checkout/exito?order=${input.orderId}`,
        failure: `${site}/checkout/error?order=${input.orderId}`,
        pending: `${site}/checkout/pendiente?order=${input.orderId}`,
      },
      auto_return: "approved",
      notification_url: `${site}/api/mercadopago/webhook`,
      statement_descriptor: "TEIA ACCESORIOS",
      metadata: { orderNumber: input.orderNumber },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MP preference error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return {
    preferenceId: data.id as string,
    initPoint: data.init_point as string,
    demo: false,
  };
}

// Consulta el estado de un pago por su id (usado por el webhook).
export async function getPayment(paymentId: string) {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return null;
  const res = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

// Mapea el estado de MP a nuestro enum PaymentStatus.
export function mapPaymentStatus(
  mpStatus: string,
): "PENDING" | "APPROVED" | "REJECTED" | "REFUNDED" {
  switch (mpStatus) {
    case "approved":
      return "APPROVED";
    case "refunded":
    case "charged_back":
      return "REFUNDED";
    case "rejected":
    case "cancelled":
      return "REJECTED";
    default:
      return "PENDING";
  }
}
