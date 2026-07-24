// @vitest-environment node
// jose usa instanceof Uint8Array; jsdom rompe eso (cross-realm) → corremos en node.
import { describe, it, expect } from "vitest";
import { SignJWT } from "jose";
import { hashPassword, verifyPassword, verifyToken } from "./auth";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET ?? "dev-secret-cambiar");

describe("passwords", () => {
  it("hashea y verifica la contraseña correcta", async () => {
    const hash = await hashPassword("secreta123");
    expect(hash).not.toBe("secreta123"); // nunca en texto plano
    expect(await verifyPassword("secreta123", hash)).toBe(true);
  });

  it("rechaza una contraseña incorrecta", async () => {
    const hash = await hashPassword("secreta123");
    expect(await verifyPassword("otra", hash)).toBe(false);
  });
});

describe("verifyToken", () => {
  it("acepta un token válido firmado con el secret", async () => {
    const token = await new SignJWT({ sub: "1", role: "admin" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(secret);
    expect(await verifyToken(token)).toBe(true);
  });

  it("rechaza basura y token vacío", async () => {
    expect(await verifyToken("no-es-un-jwt")).toBe(false);
    expect(await verifyToken("")).toBe(false);
  });

  it("rechaza un token firmado con otro secret", async () => {
    const otro = new TextEncoder().encode("secret-distinto");
    const token = await new SignJWT({ sub: "1" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(otro);
    expect(await verifyToken(token)).toBe(false);
  });

  it("rechaza un token expirado", async () => {
    const token = await new SignJWT({ sub: "1" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("-1h")
      .sign(secret);
    expect(await verifyToken(token)).toBe(false);
  });
});
