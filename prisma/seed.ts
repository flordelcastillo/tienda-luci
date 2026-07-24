import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Admin por defecto
  const email = "admin@teia.com";
  const password = await bcrypt.hash("admin1234", 10);
  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, name: "Teia", password, role: "admin" },
  });
  console.log(`✔ Admin: ${email} / admin1234`);

  // Categorías
  const cats = [
    { name: "Collares", slug: "collares" },
    { name: "Aros", slug: "aros" },
    { name: "Anillos", slug: "anillos" },
    { name: "Pulseras", slug: "pulseras" },
  ];
  for (const c of cats) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }
  const collares = await prisma.category.findUnique({ where: { slug: "collares" } });
  const aros = await prisma.category.findUnique({ where: { slug: "aros" } });

  // Limpiar productos demo viejos (fotos de Unsplash) para dejar catálogo real.
  await prisma.product.deleteMany({
    where: {
      slug: { in: ["anillo-solitario-aurora", "collar-cadena-luna", "aros-argolla-sol"] },
    },
  });

  // Catálogo real de Teia accesorios (fotos en /public/productos).
  // ⚠️ PRECIOS PLACEHOLDER en centavos de ARS — reemplazar por los reales.
  const demo = [
    // ─── Collares / Dijes ───
    {
      name: "Dije Corazón Rosa",
      slug: "dije-corazon-rosa",
      description:
        "Corazón plateado con circonita rosa en el centro y borde de corazoncitos. Cadena tipo bolita. Acero quirúrgico: no se oxida ni pierde el brillo.",
      material: "Acero quirúrgico plateado",
      gemstone: "Circonita rosa",
            measurements: "Dije 1.3 cm · cadena 45 cm",
      audience: "mujer",
      metal: "plateado",
      stoneColor: "rosa",
      theme: "corazon",
      giftIdea: true,
      giftWrap: true,
      compareAtPrice: 1900000,
      basePrice: 1500000, // ⚠️ placeholder $15.000
      categoryId: collares?.id,
      featured: true,
      images: ["/productos/dije-corazon-rosa.webp"],
      variants: [{ name: "45 cm", sku: "COR-ROSA-45", stock: 6 }],
    },
    {
      name: "Dije Corazón Cristal Aurora",
      slug: "dije-corazon-cristal-aurora",
      description:
        "Corazón de cristal facetado tornasolado (efecto aurora boreal) que cambia de color con la luz. Cadena tipo bolita en acero quirúrgico.",
      material: "Acero quirúrgico plateado",
      gemstone: "Cristal aurora boreal",
            measurements: "Dije 1.4 cm · cadena 45 cm",
      audience: "mujer",
      metal: "plateado",
      stoneColor: "aurora",
      theme: "corazon",
      giftIdea: true,
      giftWrap: true,
      basePrice: 1600000, // ⚠️ placeholder $16.000
      categoryId: collares?.id,
      featured: true,
      images: ["/productos/dije-corazon-cristal.webp"],
      variants: [{ name: "45 cm", sku: "COR-AURORA-45", stock: 5 }],
    },
    {
      name: "Dije Corazón Liso",
      slug: "dije-corazon-liso",
      description:
        "Corazón inflado liso plateado, minimalista, ideal para uso diario y para combinar en capas. Acero quirúrgico hipoalergénico.",
      material: "Acero quirúrgico plateado",
      gemstone: "",
            measurements: "Dije 1.1 cm · cadena 45 cm",
      audience: "unisex",
      metal: "plateado",
      stoneColor: "",
      theme: "corazon",
      giftIdea: false,
      giftWrap: true,
      basePrice: 1200000, // ⚠️ placeholder $12.000
      categoryId: collares?.id,
      featured: false,
      images: ["/productos/dije-corazon-plata.webp"],
      variants: [{ name: "45 cm", sku: "COR-LISO-45", stock: 8 }],
    },
    {
      name: "Dije Tulipán",
      slug: "dije-tulipan",
      description:
        "Dije de tulipán con circonita rosa y hojitas verde esmeralda. Delicado y romántico. Cadena fina en acero quirúrgico plateado.",
      material: "Acero quirúrgico plateado",
      gemstone: "Circonita rosa y verde",
            measurements: "Dije 1.5 cm · cadena 45 cm",
      audience: "mujer",
      metal: "plateado",
      stoneColor: "rosa",
      theme: "tulipan",
      giftIdea: true,
      giftWrap: true,
      compareAtPrice: 2000000,
      basePrice: 1700000, // ⚠️ placeholder $17.000
      categoryId: collares?.id,
      featured: true,
      images: ["/productos/dije-tulipan-rosa.webp"],
      variants: [{ name: "45 cm", sku: "TULIPAN-45", stock: 4 }],
    },
    {
      name: "Collar Nudo de Bruja",
      slug: "collar-nudo-de-bruja",
      description:
        "Dije de nudo de bruja (witch knot) dorado, símbolo de protección. Acero dorado que no se oxida. Un clásico místico que no pasa de moda.",
      material: "Acero quirúrgico dorado",
      gemstone: "",
            measurements: "Dije 1.4 cm · cadena 45 cm",
      audience: "unisex",
      metal: "dorado",
      stoneColor: "",
      theme: "nudo",
      giftIdea: false,
      giftWrap: false,
      basePrice: 1400000, // ⚠️ placeholder $14.000
      categoryId: collares?.id,
      featured: false,
      images: ["/productos/dije-nudo-bruja.webp"],
      variants: [{ name: "45 cm", sku: "NUDO-45", stock: 7 }],
    },
    // ─── Aros ───
    {
      name: "Aros Mariposa & Corazón (set x3)",
      slug: "aros-mariposa-corazon",
      description:
        "Set de tres pares de aros abroche en dorado rosa con circonias: mariposa grande, mariposa chica y corazón. Livianos, para combinar en varios agujeros.",
      material: "Acero quirúrgico oro rosa",
      gemstone: "Circonias",
            measurements: "Mariposa 0.8 cm · corazón 0.6 cm",
      audience: "mujer",
      metal: "oro-rosa",
      stoneColor: "",
      theme: "corazon",
      giftIdea: true,
      giftWrap: true,
      basePrice: 1100000, // ⚠️ placeholder $11.000
      categoryId: aros?.id,
      featured: true,
      images: ["/productos/aros-mariposa-corazon.webp"],
      variants: [{ name: "Set x3 pares", sku: "MARIP-SET", stock: 10 }],
    },
    {
      name: "Aros Gatito",
      slug: "aros-gatito",
      description:
        "Aros abroche de gatito con circonias y ojito negro. Chiquitos y tiernos. Disponibles en plateado o dorado.",
      material: "Acero quirúrgico",
      gemstone: "Circonias",
            measurements: "Gatito 0.7 cm",
      audience: "ninos",
      metal: "plateado",
      stoneColor: "negro",
      theme: "gatito",
      giftIdea: true,
      giftWrap: false,
      basePrice: 900000, // ⚠️ placeholder $9.000
      categoryId: aros?.id,
      featured: false,
      images: ["/productos/aros-gatito.webp"],
      variants: [
        { name: "Plateado", sku: "GATO-PLATA", stock: 8 },
        { name: "Dorado", sku: "GATO-ORO", stock: 8 },
      ],
    },
    {
      name: "Aros Tulipán",
      slug: "aros-tulipan",
      description:
        "Aros abroche de tulipán con circonias y detalle de hoja. Delicados y románticos, en acero quirúrgico plateado.",
      material: "Acero quirúrgico plateado",
      gemstone: "Circonias",
            measurements: "Tulipán 0.9 cm",
      audience: "mujer",
      metal: "plateado",
      stoneColor: "",
      theme: "tulipan",
      giftIdea: true,
      giftWrap: false,
      basePrice: 950000, // ⚠️ placeholder $9.500
      categoryId: aros?.id,
      featured: false,
      images: ["/productos/aros-tulipan.webp"],
      variants: [{ name: "Único", sku: "TULIP-AROS", stock: 9 }],
    },
    {
      name: "Aros Argolla Rosa",
      slug: "aros-argolla-rosa",
      description:
        "Argollitas tipo huggie cubiertas de circonias rosas. Brillan un montón y quedan pegadas al lóbulo. Acero quirúrgico plateado.",
      material: "Acero quirúrgico plateado",
      gemstone: "Circonita rosa",
            measurements: "Argolla 1.0 cm",
      audience: "mujer",
      metal: "plateado",
      stoneColor: "rosa",
      theme: "",
      giftIdea: false,
      giftWrap: false,
      compareAtPrice: 1300000,
      basePrice: 1000000, // ⚠️ placeholder $10.000
      categoryId: aros?.id,
      featured: true,
      images: ["/productos/aros-argolla-rosa.webp"],
      variants: [{ name: "Único", sku: "ARG-ROSA", stock: 6 }],
    },
  ];

  for (const p of demo) {
    const { variants, images, ...data } = p;
    const created = await prisma.product.upsert({
      where: { slug: p.slug },
      // Actualiza los campos editables si el producto ya existía (re-seed).
      update: data,
      create: {
        ...data,
        images: {
          create: images.map((url, i) => ({ url, alt: p.name, position: i })),
        },
        variants: { create: variants.map((v) => ({ ...v, priceDelta: 0 })) },
      },
    });
    console.log(`✔ Producto: ${created.name}`);
  }

  // Reseñas de ejemplo (prueba social). Se re-crean desde cero en cada seed.
  const reviews: Record<string, { author: string; rating: number; text: string }[]> = {
    "dije-corazon-rosa": [
      { author: "Caro G.", rating: 5, text: "Hermoso, más lindo en persona. No se me puso verde ni con el agua 💗" },
      { author: "Mica", rating: 5, text: "Lo uso todos los días para bañarme y sigue igual de brillante." },
    ],
    "dije-corazon-cristal-aurora": [
      { author: "Flor", rating: 5, text: "El tornasol es divino, cambia con la luz. Llegó rapidísimo." },
    ],
    "aros-argolla-rosa": [
      { author: "Sofi", rating: 4, text: "Re cómodos, no pesan nada. El rosa brilla un montón." },
    ],
  };
  for (const [slug, list] of Object.entries(reviews)) {
    const product = await prisma.product.findUnique({ where: { slug } });
    if (!product) continue;
    await prisma.review.deleteMany({ where: { productId: product.id } });
    await prisma.review.createMany({
      data: list.map((r) => ({ ...r, productId: product.id })),
    });
  }
  console.log("✔ Reseñas cargadas");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
