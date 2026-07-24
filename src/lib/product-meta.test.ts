import { describe, it, expect } from "vitest";
import { buildProductMetadata } from "./product-meta";

describe("buildProductMetadata", () => {
  it("arma el título con el nombre y el sitio", () => {
    const meta = buildProductMetadata({
      name: "Anillo Aurora",
      basePrice: 4500000,
    });
    expect(meta.title).toBe("Anillo Aurora · Teia accesorios");
  });

  it("usa la descripción propia del producto cuando existe", () => {
    const meta = buildProductMetadata({
      name: "Anillo Aurora",
      description: "  Anillo de plata 925 con circonita central.  ",
      basePrice: 4500000,
    });
    expect(meta.description).toBe("Anillo de plata 925 con circonita central.");
  });

  it("deriva una descripción con material y piedra cuando no hay propia", () => {
    const meta = buildProductMetadata({
      name: "Anillo Aurora",
      material: "Plata 925",
      gemstone: "Circonita",
      basePrice: 4500000,
    });
    // truncate() colapsa el NBSP del precio a un espacio normal.
    expect(meta.description).toBe(
      "Anillo Aurora en Plata 925 con Circonita. $ 45.000 — Teia accesorios.",
    );
  });

  it("descripción de respaldo sin material ni piedra", () => {
    const meta = buildProductMetadata({ name: "Anillo Aurora", basePrice: 2900000 });
    expect(meta.description).toBe("Anillo Aurora. $ 29.000 — Teia accesorios.");
  });

  it("trunca descripciones largas a 160 caracteres con elipsis", () => {
    const meta = buildProductMetadata({
      name: "X",
      description: "a".repeat(200),
      basePrice: 1000,
    });
    expect(meta.description.length).toBe(160);
    expect(meta.description.endsWith("…")).toBe(true);
  });

  it("colapsa espacios en blanco de la descripción", () => {
    const meta = buildProductMetadata({
      name: "X",
      description: "hola\n\n  mundo   varios   espacios",
      basePrice: 1000,
    });
    expect(meta.description).toBe("hola mundo varios espacios");
  });

  it("propaga la imagen para og:image", () => {
    const meta = buildProductMetadata({
      name: "X",
      basePrice: 1000,
      image: "https://cdn/x.jpg",
    });
    expect(meta.image).toBe("https://cdn/x.jpg");
  });
});
