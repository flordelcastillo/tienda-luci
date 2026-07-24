import { describe, it, expect, beforeEach, vi } from "vitest";

// --- Mocks de dependencias externas (DB y API de MP) ---
const mocks = vi.hoisted(() => {
  const tx = {
    order: { update: vi.fn() },
    productVariant: { update: vi.fn() },
  };
  return {
    tx,
    getPayment: vi.fn(),
    prisma: {
      payment: { updateMany: vi.fn() },
      order: { findUnique: vi.fn() },
      // $transaction recibe un callback y lo ejecuta con el tx mockeado.
      $transaction: vi.fn(async (cb: (t: typeof tx) => Promise<void>) => cb(tx)),
    },
  };
});

vi.mock("@/lib/prisma", () => ({ prisma: mocks.prisma }));
vi.mock("@/lib/mercadopago", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/mercadopago")>()),
  getPayment: mocks.getPayment, // mapPaymentStatus queda real
}));

import { POST } from "./route";

// Construye un NextRequest mínimo para el handler.
function makeReq(body: unknown) {
  return {
    json: async () => body,
    nextUrl: { searchParams: new URLSearchParams() },
  } as unknown as import("next/server").NextRequest;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("webhook Mercado Pago", () => {
  it("ignora notificaciones que no son de tipo payment", async () => {
    const res = await POST(makeReq({ type: "merchant_order", data: { id: "1" } }));
    expect(await res.json()).toEqual({ ok: true, ignored: true });
    expect(mocks.getPayment).not.toHaveBeenCalled();
  });

  it("descuenta stock cuando el pago se aprueba y la orden está PENDING", async () => {
    mocks.getPayment.mockResolvedValue({
      id: "pay_1",
      status: "approved",
      external_reference: "ord_1",
      payment_method_id: "visa",
    });
    mocks.prisma.order.findUnique.mockResolvedValue({
      id: "ord_1",
      status: "PENDING",
      items: [
        { variantId: "var_1", quantity: 2 },
        { variantId: null, quantity: 5 }, // sin variante → no descuenta
      ],
    });

    const res = await POST(makeReq({ type: "payment", data: { id: "pay_1" } }));

    expect(await res.json()).toEqual({ ok: true });
    expect(mocks.prisma.payment.updateMany).toHaveBeenCalledWith({
      where: { orderId: "ord_1" },
      data: { status: "APPROVED", mpPaymentId: "pay_1", method: "visa" },
    });
    expect(mocks.prisma.$transaction).toHaveBeenCalledOnce();
    expect(mocks.tx.order.update).toHaveBeenCalledWith({
      where: { id: "ord_1" },
      data: { status: "PAID" },
    });
    // Solo el item con variantId descuenta, y por su cantidad.
    expect(mocks.tx.productVariant.update).toHaveBeenCalledTimes(1);
    expect(mocks.tx.productVariant.update).toHaveBeenCalledWith({
      where: { id: "var_1" },
      data: { stock: { decrement: 2 } },
    });
  });

  it("no vuelve a descontar si la orden ya no está PENDING (idempotencia)", async () => {
    mocks.getPayment.mockResolvedValue({
      id: "pay_1",
      status: "approved",
      external_reference: "ord_1",
      payment_method_id: "visa",
    });
    mocks.prisma.order.findUnique.mockResolvedValue({
      id: "ord_1",
      status: "PAID", // ya procesada
      items: [{ variantId: "var_1", quantity: 2 }],
    });

    await POST(makeReq({ type: "payment", data: { id: "pay_1" } }));

    expect(mocks.prisma.$transaction).not.toHaveBeenCalled();
    expect(mocks.tx.productVariant.update).not.toHaveBeenCalled();
  });

  it("un pago rechazado actualiza el estado pero no toca stock", async () => {
    mocks.getPayment.mockResolvedValue({
      id: "pay_2",
      status: "rejected",
      external_reference: "ord_2",
      payment_method_id: "visa",
    });

    await POST(makeReq({ type: "payment", data: { id: "pay_2" } }));

    expect(mocks.prisma.payment.updateMany).toHaveBeenCalledWith({
      where: { orderId: "ord_2" },
      data: { status: "REJECTED", mpPaymentId: "pay_2", method: "visa" },
    });
    expect(mocks.prisma.order.findUnique).not.toHaveBeenCalled();
    expect(mocks.prisma.$transaction).not.toHaveBeenCalled();
  });
});
