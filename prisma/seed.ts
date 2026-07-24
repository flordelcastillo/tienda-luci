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
      update: {},
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

  // Catálogo de relleno para que la tienda tenga varias páginas (paginación).
  const fillerImg = "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800";
  const fillerCats = [
    { id: anillos?.id, name: "Anillo", material: "Plata 925" },
    { id: collares?.id, name: "Collar", material: "Oro 18k (baño)" },
    { id: aros?.id, name: "Aros", material: "Acero quirúrgico" },
  ];
  for (let i = 1; i <= 12; i++) {
    const c = fillerCats[i % fillerCats.length];
    const name = `${c.name} Clásico ${String(i).padStart(2, "0")}`;
    const slug = `pieza-clasica-${String(i).padStart(2, "0")}`;
    const created = await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        name,
        slug,
        description: `${name} de la colección permanente.`,
        material: c.material,
        basePrice: 1500000 + i * 100000,
        categoryId: c.id,
        images: { create: [{ url: fillerImg, alt: name, position: 0 }] },
        variants: { create: [{ name: "Único", sku: `CLA-${i}`, priceDelta: 0, stock: 10 }] },
      },
    });
    console.log(`✔ Relleno: ${created.name}`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
