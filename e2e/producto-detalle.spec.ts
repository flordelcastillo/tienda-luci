import { test, expect } from "@playwright/test";

const SLUG = "dije-corazon-rosa";
const NAME = "Dije Corazón Rosa";

test("desde la tienda se navega al detalle del producto", async ({ page }) => {
  // Buscamos el producto para que aparezca en la primera página sin depender
  // del orden/paginación del catálogo completo.
  await page.goto(`/tienda?q=${encodeURIComponent(NAME)}`);
  await page.getByRole("link", { name: new RegExp(NAME) }).first().click();

  await expect(page).toHaveURL(new RegExp(`/producto/${SLUG}`));
  await expect(page.getByRole("heading", { level: 1, name: NAME })).toBeVisible();
});

test("el detalle muestra la galería con la imagen del producto", async ({ page }) => {
  await page.goto(`/producto/${SLUG}`);

  // La imagen principal de la galería es la primera del DOM (el header no tiene
  // imágenes). Verificamos que se renderiza con el alt del producto.
  const main = page.getByRole("img").first();
  await expect(main).toBeVisible();
  await expect(main).toHaveAttribute("alt", NAME);
});

test("el flujo de compra pide los datos del cliente", async ({ page }) => {
  await page.goto(`/producto/${SLUG}`);
  await page.getByRole("button", { name: "Comprar ahora" }).click();

  await expect(page.getByLabel("Nombre y apellido")).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
});
