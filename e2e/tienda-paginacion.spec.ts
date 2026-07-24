import { test, expect } from "@playwright/test";

test("la tienda pagina y la página 2 muestra otros productos", async ({ page }) => {
  await page.goto("/tienda");
  await expect(page.getByRole("navigation", { name: "Paginación" })).toBeVisible();

  const firstOnP1 = await page
    .locator('a[href^="/producto/"]')
    .first()
    .getAttribute("href");

  await page.getByRole("link", { name: "Página 2" }).click();

  await expect(page).toHaveURL(/[?&]page=2/);
  const firstOnP2 = await page
    .locator('a[href^="/producto/"]')
    .first()
    .getAttribute("href");
  expect(firstOnP2).not.toBe(firstOnP1);

  // La página activa queda marcada para lectores de pantalla.
  await expect(page.getByRole("link", { name: "Página 2" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("paginar preserva el orden aplicado", async ({ page }) => {
  await page.goto("/tienda?sort=precio-asc");
  await page.getByRole("link", { name: "Página 2" }).click();

  await expect(page).toHaveURL(/[?&]sort=precio-asc/);
  await expect(page).toHaveURL(/[?&]page=2/);
});
