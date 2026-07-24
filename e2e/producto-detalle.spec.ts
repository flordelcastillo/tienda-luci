import { test, expect } from "@playwright/test";

const SLUG = "anillo-solitario-aurora";
const NAME = "Anillo Solitario Aurora";

test("desde la tienda se navega al detalle del producto", async ({ page }) => {
  await page.goto("/tienda");
  await page.getByRole("link", { name: new RegExp(NAME) }).first().click();

  await expect(page).toHaveURL(new RegExp(`/producto/${SLUG}`));
  await expect(page.getByRole("heading", { level: 1, name: NAME })).toBeVisible();
});

test("la galería cambia la imagen principal al elegir una miniatura", async ({
  page,
}) => {
  await page.goto(`/producto/${SLUG}`);

  // La imagen principal es la primera del DOM (el header no tiene imágenes).
  const main = page.getByRole("img").first();
  const before = await main.getAttribute("src");

  // El Aurora tiene 2 imágenes en el seed → hay miniatura para la segunda.
  await page.getByRole("button", { name: `Ver imagen 2 de ${NAME}` }).click();

  await expect(main).not.toHaveAttribute("src", before ?? "");
});

test("el flujo de compra pide los datos del cliente", async ({ page }) => {
  await page.goto(`/producto/${SLUG}`);
  await page.getByRole("button", { name: "Comprar ahora" }).click();

  await expect(page.getByLabel("Nombre y apellido")).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
});
