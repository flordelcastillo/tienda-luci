import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { Toaster } from "sonner";
import { getSettings } from "@/lib/settings";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Teia accesorios",
  description:
    "Accesorios en acero quirúrgico — dijes, aros y más. No se oxidan ni manchan la piel.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { colorPrimary, colorAccent, colorBg, colorNeutral, colorRose, colorText } =
    await getSettings();

  return (
    <html
      lang="es"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        {/* Colores de marca editables desde el panel de administración. */}
        <style
          dangerouslySetInnerHTML={{
            __html: `:root{--sage:${colorPrimary};--gold:${colorAccent};--cream:${colorBg};--sand:${colorNeutral};--rose:${colorRose};--ink:${colorText};}`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#fff",
              border: "1px solid var(--line)",
              color: "var(--ink)",
            },
          }}
        />
      </body>
    </html>
  );
}
