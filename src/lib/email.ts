import "server-only";
import nodemailer from "nodemailer";
import { formatARS } from "./money";
import { getSettings } from "./settings";
import { deliveryLabel } from "./delivery";

// Envío de mails vía SMTP. Las credenciales se toman de variables de entorno;
// si no están configuradas, las funciones no hacen nada (no rompen el pedido).
function getTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? "587"),
    secure: process.env.SMTP_PORT === "465",
    auth: { user, pass },
  });
}

type OrderForEmail = {
  number: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryZone: string;
  shippingAddr: string;
  total: number;
  items: { nameSnapshot: string; quantity: number; lineTotal: number }[];
};

/**
 * Avisa por mail a la tienda que entró un pedido nuevo. No bloquea ni falla el
 * checkout: si no hay SMTP o falla el envío, solo se registra en consola.
 */
export async function sendOrderNotification(order: OrderForEmail) {
  try {
    const transport = getTransport();
    if (!transport) return; // sin SMTP configurado: se omite el aviso.

    const settings = await getSettings();
    const to = settings.notifyEmail || process.env.SMTP_USER;
    if (!to) return;

    const from = process.env.SMTP_FROM ?? process.env.SMTP_USER!;
    const lines = order.items
      .map((i) => `• ${i.nameSnapshot} x${i.quantity} — ${formatARS(i.lineTotal)}`)
      .join("\n");

    const text =
      `Nuevo pedido #${order.number}\n\n` +
      `${lines}\n\n` +
      `Total: ${formatARS(order.total)}\n\n` +
      `Cliente: ${order.customerName}\n` +
      `Teléfono: ${order.customerPhone}\n` +
      (order.customerEmail ? `Email: ${order.customerEmail}\n` : "") +
      `Entrega: ${deliveryLabel(order.deliveryZone)}\n` +
      (order.shippingAddr ? `Dirección: ${order.shippingAddr}\n` : "");

    await transport.sendMail({
      from: `"${settings.brandName}" <${from}>`,
      to,
      subject: `Nuevo pedido #${order.number} — ${formatARS(order.total)}`,
      text,
    });
  } catch (e) {
    console.error("No se pudo enviar el aviso de pedido por mail:", e);
  }
}
