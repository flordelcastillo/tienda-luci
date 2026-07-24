"use client";

import { useState } from "react";
import { Input } from "@/components/ui";

// Sistema argentino de talles de anillo:
//   circunferencia (mm) = talle + 40   →   talle = circunferencia − 40
//   diámetro (mm)       = circunferencia / π
// Talles usables: 10 a 25.
type Mode = "diametro" | "circunferencia";

function talleFrom(value: number, mode: Mode): number | null {
  if (!Number.isFinite(value) || value <= 0) return null;
  const circ = mode === "diametro" ? value * Math.PI : value;
  const talle = Math.round(circ - 40);
  if (talle < 10 || talle > 25) return null;
  return talle;
}

export function RingSizeCalculator() {
  const [mode, setMode] = useState<Mode>("diametro");
  const [raw, setRaw] = useState("");

  const value = parseFloat(raw.replace(",", "."));
  const talle = talleFrom(value, mode);
  const showError = raw.trim() !== "" && talle === null;

  return (
    <div className="border-line rounded-[var(--radius-card)] border bg-white p-6">
      <div className="mb-4 flex gap-2">
        {(
          [
            { key: "diametro", label: "Diámetro interno" },
            { key: "circunferencia", label: "Circunferencia" },
          ] as const
        ).map((o) => (
          <button
            key={o.key}
            type="button"
            onClick={() => setMode(o.key)}
            className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
              mode === o.key
                ? "bg-sage text-cream"
                : "border-line text-muted hover:bg-sand/50 border"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <label className="text-muted text-sm" htmlFor="ring-mm">
        {mode === "diametro"
          ? "Diámetro interno del anillo en mm"
          : "Contorno del dedo (hilo) en mm"}
      </label>
      <div className="mt-1 flex items-center gap-2">
        <Input
          id="ring-mm"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.1"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={mode === "diametro" ? "ej. 17.2" : "ej. 54"}
          className="w-40"
        />
        <span className="text-muted text-sm">mm</span>
      </div>

      <div className="mt-4 min-h-12" aria-live="polite">
        {talle !== null && (
          <p className="text-ink">
            Tu talle aproximado es{" "}
            <span className="font-display text-sage text-3xl">{talle}</span>
          </p>
        )}
        {showError && (
          <p className="text-muted text-sm">
            Ese valor queda fuera de la tabla (talles 10 a 25). Revisá la medida.
          </p>
        )}
      </div>

      <p className="text-muted mt-2 text-xs">
        Es una estimación. Ante la duda, elegí el talle más grande.
      </p>
    </div>
  );
}
