import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mapPaymentStatus, createPreference } from "./mercadopago";

describe("mapPaymentStatus", () => {
  it("mapea aprobado", () => {
    expect(mapPaymentStatus("approved")).toBe("APPROVED");
  });

  it("mapea rechazado y cancelado", () => {
    expect(mapPaymentStatus("rejected")).toBe("REJECTED");
    expect(mapPaymentStatus("cancelled")).toBe("REJECTED");
  });

  it("mapea reintegro y contracargo a REFUNDED", () => {
    expect(mapPaymentStatus("refunded")).toBe("REFUNDED");
    expect(mapPaymentStatus("charged_back")).toBe("REFUNDED");
  });

  it("cualquier otro estado cae en PENDING", () => {
    expect(mapPaymentStatus("in_process")).toBe("PENDING");
    expect(mapPaymentStatus("desconocido")).toBe("PENDING");
  });
});

describe("createPreference (modo demo)", () => {
  const OLD = process.env.MP_ACCESS_TOKEN;

  beforeEach(() => {
    delete process.env.MP_ACCESS_TOKEN; // sin token → modo demo
  });
  afterEach(() => {
    if (OLD === undefined) delete process.env.MP_ACCESS_TOKEN;
    else process.env.MP_ACCESS_TOKEN = OLD;
    vi.restoreAllMocks();
  });

  it("sin token no llama a la red y devuelve URL demo", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const pref = await createPreference({
      orderId: "ord_1",
      orderNumber: 1,
      items: [{ title: "Anillo", quantity: 1, unit_price: 100, currency_id: "ARS" }],
      payer: { name: "Ada", email: "ada@example.com" },
    });

    expect(pref.demo).toBe(true);
    expect(pref.preferenceId).toBe("demo-ord_1");
    expect(pref.initPoint).toContain("/checkout/demo?order=ord_1");
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
