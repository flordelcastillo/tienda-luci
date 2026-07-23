# Design System — Luci Joyas

Estilo definido a partir del análisis de las referencias (Lumora, Fleur, Posy Petal, Astra).
Concepto: **elegante · minimalista · femenino · editorial de lujo accesible** ("Soft UI").

Este documento es la fuente de verdad del diseño. Todo componente nuevo debe respetarlo.

---

## 1. Principios

1. **Aire antes que densidad.** Mucho whitespace, respiración entre secciones.
2. **Serif para emoción, sans para función.** Títulos con serif (y acentos en *itálica*); UI y cuerpo con sans.
3. **Suavidad.** Esquinas redondeadas, formas de arco/blob orgánicas, sombras difusas y sutiles.
4. **El oro es el lujo.** Se usa con moderación, como acento premium — nunca como fondo dominante.
5. **Baja saturación.** Paleta pastel, tierra y verde apagado. Nada estridente.
6. **La foto manda.** El producto (la joya) es el héroe; el fondo es neutro y no compite.

---

## 2. Paleta

| Token | Hex | Uso |
|---|---|---|
| `cream` | `#F7F3EF` | Fondo principal de la página |
| `sand` | `#E8DDD2` | Neutro cálido, fondos de imagen, superficies suaves |
| `sage` | `#3B4A3F` | **Primario de marca** — botones, títulos, header |
| `sage-soft` | `#6B7D70` | Variante clara del primario |
| `rose` | `#E7C8C4` | Acento rosa empolvado — badges, detalles |
| `rose-soft` | `#F2E0DD` | Fondos rosados muy suaves |
| `gold` | `#C9A96A` | **Detalle premium** — destacados, líneas finas |
| `gold-dark` | `#A8863F` | Texto/hover sobre oro, eyebrows |
| `ink` | `#2A2724` | Texto principal |
| `muted` | `#7A736C` | Texto secundario |
| `line` | `#E4DBD1` | Bordes y divisores |

**Reglas de color**
- Fondo de página siempre `cream`. Tarjetas/superficies en `white`.
- CTA primario: fondo `sage`, texto `cream`.
- CTA premium/secundario: `gold`.
- Nunca poner texto `muted` sobre `sand` (contraste insuficiente). Usar `ink` o `sage`.
- El oro va en acentos pequeños (badges, "eyebrows", líneas), no en superficies grandes.

Definidos como CSS variables en [globals.css](src/app/globals.css) y expuestos a Tailwind vía `@theme`
(ej. `bg-sage`, `text-gold-dark`, `border-line`).

---

## 3. Tipografía

| Rol | Fuente | Dónde |
|---|---|---|
| Display / títulos | **Playfair Display** (serif) | h1–h3, precios, nombres de producto |
| Cuerpo / UI | **Inter** (sans) | párrafos, botones, labels, tablas |

- Cargadas con `next/font` en [layout.tsx](src/app/layout.tsx) → variables `--font-playfair` / `--font-inter`.
- Clase utilitaria `.font-display` para forzar serif en cualquier elemento.
- **Acento editorial:** en títulos, resaltar una palabra en *itálica* + color `sage`
  (ej: "Brillá con lo *esencial*").
- **Eyebrow** (antetítulo): texto chico, `uppercase`, `tracking-[0.2em]`, color `gold-dark`.

**Escala sugerida**
- Hero: `text-5xl`/`text-6xl`, `leading-[1.05]`
- Sección: `text-3xl`
- Card título: base/`text-lg`
- Body: `text-sm`/base, `text-muted` para secundario

---

## 4. Forma y espaciado

- **Radio de tarjeta:** `--radius-card: 1.25rem` (`rounded-[var(--radius-card)]`).
- **Botones y pills:** siempre `rounded-full`.
- **Arco (`.arch`):** forma superior redondeada para fotos de producto (referencia Fleur/Astra).
- **Contenedor:** `max-w-6xl mx-auto px-6`.
- **Ritmo vertical:** secciones separadas con `mt-20`; interior de card `p-6`.
- **Sombra:** difusa y verdosa, nunca negra dura —
  `shadow-[0_2px_20px_-8px_rgba(59,74,63,0.12)]`; en hover se intensifica.

---

## 5. Componentes (contratos)

Todos viven en [src/components/ui.tsx](src/components/ui.tsx) y usan `cva` + `cn()` (tailwind-merge).

- **Button / LinkButton** — variantes: `primary` (sage), `outline`, `gold`, `ghost`, `danger`.
  Siempre `rounded-full`, transición de color. Íconos vía `lucide-react`.
- **Card** — superficie blanca, borde `line`, sombra suave, radio de card.
- **Badge** — pill chico. Tonos: `sage`, `gold`, `rose`, `red`, `gray`.
- **Field / Input / Textarea / Select** — inputs `rounded-xl`, borde `line`,
  focus con anillo `sage/15`.
- **Toasts** — `sonner`, posición top-center, para feedback de acciones del admin.

**Iconografía:** `lucide-react` (trazo fino, coherente con la estética). Nunca glyphs de texto.

---

## 6. Interacción / movimiento

- Transiciones suaves: `transition-colors`, `duration-300/500`.
- Hover de producto: `scale-105` sobre la imagen, dentro de contenedor `overflow-hidden`.
- Reveal de secciones: fade + subida leve (con `framer-motion` cuando se agregue).
- Nunca animaciones bruscas o rebotes marcados — el tono es sereno.

---

## 7. Tono de voz (copy)

- Cálido, cercano, en español rioplatense ("Brillá", "Conocé", "tu día a día").
- Frases cortas. Evitar jerga técnica de cara al cliente.
- Enfatizar: artesanal, atemporal, calidad, cuidado.

---

## 8. Accesibilidad (mínimos)

- Contraste AA: texto principal siempre `ink`/`sage` sobre `cream`/`white`.
- Todo control interactivo con estado `:focus` visible (anillo `sage`).
- Imágenes con `alt` descriptivo (el admin lo permite cargar por imagen).
- Targets táctiles ≥ 40px.

---

## Referencias visuales
Las 4 imágenes fuente están en [refs/](refs/). Aportaron:
- **Lumora** → estructura ecommerce + paleta salvia/rosa.
- **Fleur** → arcos, tierra, serif, aire.
- **Posy Petal** → acentos y feminidad (adaptado, menos lila).
- **Astra** → soft UI, gradientes suaves, itálicas.
