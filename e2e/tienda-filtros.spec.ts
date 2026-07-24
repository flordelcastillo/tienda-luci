import { test, expect } from "@playwright/test";

test("la tienda muestra el buscador y el rango de precio", async ({ page }) => {
  await page.goto("/tienda");
  await expect(page.getByRole("search")).toBeVisible();
  await expect(page.getByLabel("Buscar productos")).toBeVisible();
  await expect(page.getByLabel("Precio mínimo")).toBeVisible();
});

test("buscar por nombre mantiene el término en la URL y el input", async ({ page }) => {
  await page.goto("/tienda");
  await page.getByLabel("Buscar productos").fill("anillo");
  await page.getByRole("button", { name: "Filtrar" }).click();

  await expect(page).toHaveURL(/[?&]q=anillo/);
  await expect(page.getByLabel("Buscar productos")).toHaveValue("anillo");
  // Con filtros activos aparece el enlace para limpiar.
  await expect(page.getByRole("link", { name: /Limpiar/ })).toBeVisible();
});

test("cambiar el orden auto-envía y queda reflejado en la URL y el select", async ({
  page,
}) => {
  await page.goto("/tienda");
  // El select de orden auto-envía el formulario al cambiar (sin tocar "Filtrar").
  await page.getByLabel("Ordenar por").selectOption("precio-asc");

  await expect(page).toHaveURL(/[?&]sort=precio-asc/);
  await expect(page.getByLabel("Ordenar por")).toHaveValue("precio-asc");
});
