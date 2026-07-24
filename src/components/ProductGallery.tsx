"use client";

import { useState } from "react";

type GalleryImage = { id: string; url: string; alt: string };

// Galería del detalle de producto: imagen principal + miniaturas seleccionables.
// Client component para poder cambiar la imagen activa sin recargar.
export function ProductGallery({
  images,
  name,
}: {
  images: GalleryImage[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className="space-y-3">
      <div className="bg-sand aspect-square overflow-hidden rounded-[var(--radius-card)]">
        {current && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.url}
            alt={current.alt || name}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.slice(0, 8).map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver imagen ${i + 1} de ${name}`}
              aria-current={i === active}
              className={`bg-sand aspect-square overflow-hidden rounded-xl border-2 transition-colors ${
                i === active ? "border-sage" : "hover:border-line border-transparent"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt || `${name} ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
