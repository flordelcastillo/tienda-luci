import { getSettings } from "@/lib/settings";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function AjustesPage() {
  const s = await getSettings();

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <h1 className="font-display text-ink text-3xl">Ajustes de la tienda</h1>
        <p className="text-muted mt-1 text-sm">
          Editá los textos, colores, imagen de portada y datos de contacto. Los cambios se
          aplican a toda la página.
        </p>
      </header>

      <SettingsForm
        initial={{
          brandName: s.brandName,
          announcement: s.announcement,
          heroKicker: s.heroKicker,
          heroTitle: s.heroTitle,
          heroSubtitle: s.heroSubtitle,
          heroTagline: s.heroTagline,
          heroImage: s.heroImage,
          footerText: s.footerText,
          whatsapp: s.whatsapp,
          notifyEmail: s.notifyEmail,
          freeShippingPesos: Math.round(s.freeShippingCents / 100),
          colorPrimary: s.colorPrimary,
          colorAccent: s.colorAccent,
          colorBg: s.colorBg,
          colorNeutral: s.colorNeutral,
          colorRose: s.colorRose,
          colorText: s.colorText,
        }}
      />
    </div>
  );
}
