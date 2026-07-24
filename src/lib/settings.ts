import { cache } from "react";
import { prisma } from "./prisma";

// Configuración editable de la tienda desde el panel. Los textos vacíos caen a
// estos valores por defecto para que la página nunca quede en blanco.
export const SETTINGS_DEFAULTS = {
  brandName: "Teia",
  announcement: "Todas las piezas en acero quirúrgico, aptas para agua",
  heroKicker: "Nueva colección",
  heroTitle: "Brillá con lo esencial.",
  heroSubtitle:
    "Accesorios delicados en acero quirúrgico: dijes, aros y más. No se oxidan, no manchan la piel y te acompañan todos los días.",
  heroTagline: "Bijou que dura como una joya, a precio de bijou.",
  heroImage: "",
  footerText:
    "Accesorios en acero quirúrgico. Piezas delicadas que no se oxidan, pensadas para acompañarte todos los días.",
  whatsapp: "5492657528266",
  freeShippingCents: 3000000,
  colorPrimary: "#3b4a3f",
  colorAccent: "#c9a96a",
  colorBg: "#f7f3ef",
  colorNeutral: "#e8ddd2",
  colorRose: "#e7c8c4",
  colorText: "#2a2724",
};

export type SiteSettings = typeof SETTINGS_DEFAULTS;

const pick = (v: string | null | undefined, d: string) =>
  v && v.trim() ? v : d;

/** Configuración efectiva (fila de la DB combinada con los defaults). */
export const getSettings = cache(async (): Promise<SiteSettings> => {
  const row = await prisma.siteSetting.findUnique({ where: { id: "main" } });
  if (!row) return { ...SETTINGS_DEFAULTS };
  return {
    brandName: pick(row.brandName, SETTINGS_DEFAULTS.brandName),
    announcement: pick(row.announcement, SETTINGS_DEFAULTS.announcement),
    heroKicker: pick(row.heroKicker, SETTINGS_DEFAULTS.heroKicker),
    heroTitle: pick(row.heroTitle, SETTINGS_DEFAULTS.heroTitle),
    heroSubtitle: pick(row.heroSubtitle, SETTINGS_DEFAULTS.heroSubtitle),
    heroTagline: pick(row.heroTagline, SETTINGS_DEFAULTS.heroTagline),
    heroImage: row.heroImage ?? "",
    footerText: pick(row.footerText, SETTINGS_DEFAULTS.footerText),
    whatsapp: pick(row.whatsapp, SETTINGS_DEFAULTS.whatsapp),
    freeShippingCents: row.freeShippingCents ?? SETTINGS_DEFAULTS.freeShippingCents,
    colorPrimary: pick(row.colorPrimary, SETTINGS_DEFAULTS.colorPrimary),
    colorAccent: pick(row.colorAccent, SETTINGS_DEFAULTS.colorAccent),
    colorBg: pick(row.colorBg, SETTINGS_DEFAULTS.colorBg),
    colorNeutral: pick(row.colorNeutral, SETTINGS_DEFAULTS.colorNeutral),
    colorRose: pick(row.colorRose, SETTINGS_DEFAULTS.colorRose),
    colorText: pick(row.colorText, SETTINGS_DEFAULTS.colorText),
  };
});
