import { test, expect } from "@playwright/test";

const SLUG = "anillo-solitario-aurora";
const NAME = "Anillo Solitario Aurora";

test("agregar un producto al carrito lo muestra y actualiza el badge", async ({
  page,
}) => {
  await page.goto(`/producto/${SLUG}`);
  await page.getByRole("button", { name: "Agregar al carrito" }).click();

  // El server action redirige al carrito.
  await expect(page).toHaveURL(/\/carrito/);
  // El nombre aparece como link (además del link-imagen), tomamos el primero.
  await expect(page.getByRole("link", { name: NAME }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Finalizar compra" })).toBeVisible();

  // Badge del header con la cantidad.
  await expect(page.getByRole("link", { name: /Carrito \(1\)/ })).toBeVisible();
});

test("sumar cantidad y luego quitar vacía el carrito", async ({ page }) => {
  await page.goto(`/producto/${SLUG}`);
  await page.getByRole("button", { name: "Agregar al carrito" }).click();
  await expect(page).toHaveURL(/\/carrito/);

  // Suma una unidad → cantidad pasa a 2.
  await page.getByRole("button", { name: "Sumar uno" }).click();
  await expect(page.getByLabel("Cantidad")).toHaveText("2");

  // Quita la línea → carrito vacío.
  await page.getByRole("button", { name: "Quitar" }).click();
  await expect(page.getByText("Tu carrito está vacío")).toBeVisible();
});
