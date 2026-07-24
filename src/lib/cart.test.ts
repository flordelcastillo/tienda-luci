import { describe, it, expect } from "vitest";
import {
  parseCart,
  serializeCart,
  addLine,
  setQty,
  removeLine,
  cartCount,
  buildCartItems,
  MAX_LINE_QTY,
  type ProductForCart,
} from "./cart";

describe("parseCart", () => {
  it("sin valor o inválido devuelve carrito vacío", () => {
    expect(parseCart()).toEqual([]);
    expect(parseCart(null)).toEqual([]);
    expect(parseCart("")).toEqual([]);
    expect(parseCart("no-json")).toEqual([]);
    expect(parseCart('{"a":1}')).toEqual([]);
  });

  it("parsea líneas válidas", () => {
    const raw = JSON.stringify([{ productId: "p1", variantId: "v1", qty: 2 }]);
    expect(parseCart(raw)).toEqual([{ productId: "p1", variantId: "v1", qty: 2 }]);
  });

  it("descarta líneas sin producto o variante", () => {
    const raw = JSON.stringify([
      { productId: "", variantId: "v1", qty: 1 },
      { variantId: "v1", qty: 1 },
      { productId: "p1", qty: 1 },
      { productId: "p1", variantId: "v1", qty: 1 },
    ]);
    expect(parseCart(raw)).toEqual([{ productId: "p1", variantId: "v1", qty: 1 }]);
  });

  it("sanea cantidades inválidas a 1 y respeta el tope", () => {
    const raw = JSON.stringify([
      { productId: "p1", variantId: "v1", qty: 0 },
      { productId: "p2", variantId: "v2", qty: 999 },
      { productId: "p3", variantId: "v3", qty: "x" },
    ]);
    expect(parseCart(raw)).toEqual([
      { productId: "p1", variantId: "v1", qty: 1 },
      { productId: "p2", variantId: "v2", qty: MAX_LINE_QTY },
      { productId: "p3", variantId: "v3", qty: 1 },
    ]);
  });

  it("colapsa duplicados sumando cantidades", () => {
    const raw = JSON.stringify([
      { productId: "p1", variantId: "v1", qty: 2 },
      { productId: "p1", variantId: "v1", qty: 3 },
    ]);
    expect(parseCart(raw)).toEqual([{ productId: "p1", variantId: "v1", qty: 5 }]);
  });

  it("es inversa de serializeCart", () => {
    const lines = [{ productId: "p1", variantId: "v1", qty: 2 }];
    expect(parseCart(serializeCart(lines))).toEqual(lines);
  });
});

describe("addLine", () => {
  it("agrega una línea nueva", () => {
    expect(addLine([], { productId: "p1", variantId: "v1" })).toEqual([
      { productId: "p1", variantId: "v1", qty: 1 },
    ]);
  });

  it("suma la cantidad si el producto+variante ya existía", () => {
    const start = [{ productId: "p1", variantId: "v1", qty: 2 }];
    expect(addLine(start, { productId: "p1", variantId: "v1", qty: 3 })).toEqual([
      { productId: "p1", variantId: "v1", qty: 5 },
    ]);
  });

  it("distingue variantes del mismo producto", () => {
    const start = [{ productId: "p1", variantId: "v1", qty: 1 }];
    expect(addLine(start, { productId: "p1", variantId: "v2", qty: 1 })).toEqual([
      { productId: "p1", variantId: "v1", qty: 1 },
      { productId: "p1", variantId: "v2", qty: 1 },
    ]);
  });

  it("no muta el array original", () => {
    const start = [{ productId: "p1", variantId: "v1", qty: 1 }];
    addLine(start, { productId: "p1", variantId: "v1", qty: 1 });
    expect(start).toEqual([{ productId: "p1", variantId: "v1", qty: 1 }]);
  });

  it("acota al tope máximo por línea", () => {
    const start = [{ productId: "p1", variantId: "v1", qty: MAX_LINE_QTY }];
    expect(addLine(start, { productId: "p1", variantId: "v1", qty: 5 })[0].qty).toBe(
      MAX_LINE_QTY,
    );
  });
});

describe("setQty", () => {
  it("actualiza la cantidad de una línea", () => {
    const start = [{ productId: "p1", variantId: "v1", qty: 1 }];
    expect(setQty(start, { productId: "p1", variantId: "v1" }, 4)).toEqual([
      { productId: "p1", variantId: "v1", qty: 4 },
    ]);
  });

  it("elimina la línea si la cantidad es 0 o menos", () => {
    const start = [{ productId: "p1", variantId: "v1", qty: 2 }];
    expect(setQty(start, { productId: "p1", variantId: "v1" }, 0)).toEqual([]);
  });
});

describe("removeLine", () => {
  it("elimina la línea indicada", () => {
    const start = [
      { productId: "p1", variantId: "v1", qty: 1 },
      { productId: "p2", variantId: "v2", qty: 1 },
    ];
    expect(removeLine(start, { productId: "p1", variantId: "v1" })).toEqual([
      { productId: "p2", variantId: "v2", qty: 1 },
    ]);
  });
});

describe("cartCount", () => {
  it("suma las cantidades de todas las líneas", () => {
    expect(cartCount([])).toBe(0);
    expect(
      cartCount([
        { productId: "p1", variantId: "v1", qty: 2 },
        { productId: "p2", variantId: "v2", qty: 3 },
      ]),
    ).toBe(5);
  });
});

describe("buildCartItems", () => {
  const products: ProductForCart[] = [
    {
      id: "p1",
      name: "Anillo Aurora",
      slug: "anillo-aurora",
      basePrice: 4500000,
      image: "img1",
      variants: [
        { id: "v1", name: "Talle 14", priceDelta: 0, stock: 3 },
        { id: "v2", name: "Talle 16", priceDelta: 50000, stock: 5 },
      ],
    },
    {
      id: "p2",
      name: "Collar Luna",
      slug: "collar-luna",
      basePrice: 3800000,
      variants: [{ id: "v3", name: "45cm", priceDelta: 0, stock: 8 }],
    },
  ];

  it("arma líneas con precio unitario, total y subtotal", () => {
    const { items, subtotal } = buildCartItems(
      [
        { productId: "p1", variantId: "v2", qty: 2 },
        { productId: "p2", variantId: "v3", qty: 1 },
      ],
      products,
    );
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      name: "Anillo Aurora",
      variantName: "Talle 16",
      slug: "anillo-aurora",
      image: "img1",
      unitPrice: 4550000,
      qty: 2,
      lineTotal: 9100000,
    });
    expect(items[1].lineTotal).toBe(3800000);
    expect(subtotal).toBe(12900000);
  });

  it("descarta líneas de productos o variantes inexistentes", () => {
    const { items, subtotal } = buildCartItems(
      [
        { productId: "fantasma", variantId: "v1", qty: 1 },
        { productId: "p1", variantId: "no-existe", qty: 1 },
      ],
      products,
    );
    expect(items).toEqual([]);
    expect(subtotal).toBe(0);
  });

  it("acota la cantidad al stock disponible", () => {
    const { items } = buildCartItems(
      [{ productId: "p1", variantId: "v1", qty: 10 }],
      products,
    );
    expect(items[0].qty).toBe(3); // stock de v1
    expect(items[0].lineTotal).toBe(4500000 * 3);
  });

  it("descarta líneas sin stock", () => {
    const sinStock: ProductForCart[] = [
      {
        id: "p1",
        name: "X",
        slug: "x",
        basePrice: 1000,
        variants: [{ id: "v1", name: "U", priceDelta: 0, stock: 0 }],
      },
    ];
    const { items } = buildCartItems(
      [{ productId: "p1", variantId: "v1", qty: 1 }],
      sinStock,
    );
    expect(items).toEqual([]);
  });
});
