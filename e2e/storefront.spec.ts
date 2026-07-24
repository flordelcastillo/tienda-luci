import { test, expect } from "@playwright/test";

test("la home carga y responde 200", async ({ page }) => {
  const res = await page.goto("/");
  expect(res?.status()).toBe(200);
});

test("la tienda es accesible", async ({ page }) => {
  const res = await page.goto("/tienda");
  expect(res?.ok()).toBeTruthy();
});
