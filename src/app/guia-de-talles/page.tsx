import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/storefront";
import { RingSizeCalculator } from "@/components/RingSizeCalculator";

export const metadata: Metadata = {
  title: "Guía de talles · Teia accesorios",
  description:
    "Cómo saber tu talle de anillo y de pulsera desde casa, con tabla de conversión y calculadora.",
};

// Sistema argentino: circunferencia (mm) = talle + 40; diámetro = circ / π.
const RING_ROWS = Array.from({ length: 16 }, (_, i) => {
  const talle = 10 + i;
  const circ = talle + 40;
  return { talle, circ, diam: (circ / Math.PI).toFixed(1) };
});

const BRACELET_ROWS = [
  { talle: "Chica (S)", wrist: "14 – 15 cm", length: "16 – 17 cm" },
  { talle: "Mediana (M)", wrist: "15 – 16 cm", length: "17 – 18 cm" },
  { talle: "Grande (L)", wrist: "16 – 17 cm", length: "18 – 19 cm" },
];

export default function GuiaDeTallesPage() {
  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-4xl px-6 py-12">
        <p className="text-gold-dark text-xs tracking-[0.2em] uppercase">Ayuda</p>
        <h1 className="font-display text-ink mt-2 text-4xl">Guía de talles</h1>
        <p className="text-muted mt-3 max-w-2xl">
          Averiguá tu talle desde casa con una regla y un poco de hilo o papel. Ante la
          duda, siempre conviene elegir el talle más grande.
        </p>

        {/* ── Anillos ── */}
        <section className="mt-12">
          <h2 className="font-display text-ink text-2xl">Talle de anillo</h2>

          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <div className="border-line rounded-[var(--radius-card)] border bg-white p-6">
              <p className="text-ink font-medium">
                Opción 1 · Medí un anillo que ya tengas
              </p>
              <ol className="text-muted mt-3 list-decimal space-y-1.5 pl-5 text-sm">
                <li>Elegí un anillo que te quede bien en ese dedo.</li>
                <li>
                  Con una regla, medí el <strong>diámetro interno</strong> en mm (de borde
                  a borde por dentro, sin contar el metal).
                </li>
                <li>Ingresá ese número en la calculadora.</li>
              </ol>
            </div>
            <div className="border-line rounded-[var(--radius-card)] border bg-white p-6">
              <p className="text-ink font-medium">Opción 2 · Medí tu dedo</p>
              <ol className="text-muted mt-3 list-decimal space-y-1.5 pl-5 text-sm">
                <li>
                  Envolvé el dedo con un hilo o tira de papel en la parte más ancha.
                </li>
                <li>Marcá dónde se cruzan las puntas.</li>
                <li>
                  Estirá y medí en mm: esa es tu <strong>circunferencia</strong>.
                </li>
              </ol>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <RingSizeCalculator />

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="text-muted mb-2 text-left text-xs">
                  Tabla de conversión (sistema argentino)
                </caption>
                <thead>
                  <tr className="text-muted border-line border-b text-left">
                    <th className="py-2 font-medium">Talle</th>
                    <th className="py-2 font-medium">Diámetro</th>
                    <th className="py-2 font-medium">Circunferencia</th>
                  </tr>
                </thead>
                <tbody>
                  {RING_ROWS.map((r) => (
                    <tr key={r.talle} className="border-line/60 border-b">
                      <td className="text-ink py-1.5 font-medium">{r.talle}</td>
                      <td className="text-muted py-1.5">{r.diam} mm</td>
                      <td className="text-muted py-1.5">{r.circ} mm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-muted mt-3 text-xs">
            Consejo: medí el dedo al final del día y con calor; a la mañana o con frío los
            dedos se achican.
          </p>
        </section>

        {/* ── Pulseras ── */}
        <section className="mt-14">
          <h2 className="font-display text-ink text-2xl">Talle de pulsera</h2>
          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            <div className="border-line rounded-[var(--radius-card)] border bg-white p-6">
              <p className="text-ink font-medium">Cómo medir tu muñeca</p>
              <ol className="text-muted mt-3 list-decimal space-y-1.5 pl-5 text-sm">
                <li>
                  Envolvé la muñeca con un hilo o cinta métrica, justo debajo del hueso.
                </li>
                <li>Medí la circunferencia en cm.</li>
                <li>
                  Sumá <strong>1,5 a 2 cm</strong> para que la pulsera quede cómoda (más
                  para un calce holgado).
                </li>
              </ol>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="text-muted mb-2 text-left text-xs">
                  Referencia orientativa
                </caption>
                <thead>
                  <tr className="text-muted border-line border-b text-left">
                    <th className="py-2 font-medium">Talle</th>
                    <th className="py-2 font-medium">Muñeca</th>
                    <th className="py-2 font-medium">Largo pulsera</th>
                  </tr>
                </thead>
                <tbody>
                  {BRACELET_ROWS.map((r) => (
                    <tr key={r.talle} className="border-line/60 border-b">
                      <td className="text-ink py-1.5 font-medium">{r.talle}</td>
                      <td className="text-muted py-1.5">{r.wrist}</td>
                      <td className="text-muted py-1.5">{r.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <p className="text-muted mt-12 text-sm">
          ¿Seguís con dudas? Escribinos y te ayudamos a elegir el talle.
        </p>
      </div>
      <SiteFooter />
    </>
  );
}
