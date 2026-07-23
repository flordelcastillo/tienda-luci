import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Admin por defecto
  const email = "admin@luci.com";
  const password = await bcrypt.hash("admin1234", 10);
  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, name: "Luci", password, role: "admin" },
  });
  console.log(`✔ Admin: ${email} / admin1234`);

  // Categorías
  const cats = [
    { name: "Anillos", slug: "anillos" },
    { name: "Collares", slug: "collares" },
    { name: "Aros", slug: "aros" },
    { name: "Pulseras", slug: "pulseras" },
  ];
  for (const c of cats) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }
  const anillos = await prisma.category.findUnique({ where: { slug: "anillos" } });
  const collares = await prisma.category.findUnique({ where: { slug: "collares" } });
  const aros = await prisma.category.findUnique({ where: { slug: "aros" } });

  // Productos de ejemplo
  const demo = [
    {
      name: "Anillo Solitario Aurora",
      slug: "anillo-solitario-aurora",
      description: "Anillo de plata 925 con circonita central talla brillante.",
      material: "Plata 925",
      gemstone: "Circonita",
      basePrice: 4500000,
      categoryId: anillos?.id,
      featured: true,
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800",
      variants: [
        { name: "Talle 14", sku: "AUR-14", stock: 3 },
        { name: "Talle 16", sku: "AUR-16", stock: 5 },
        { name: "Talle 18", sku: "AUR-18", stock: 2 },
      ],
    },
    {
      name: "Collar Cadena Luna",
      slug: "collar-cadena-luna",
      description: "Collar delicado con dije de luna en baño de oro 18k.",
      material: "Oro 18k (baño)",
      gemstone: "",
      basePrice: 3800000,
      categoryId: collares?.id,
      featured: true,
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800",
      variants: [{ name: "45 cm", sku: "LUN-45", stock: 8 }],
    },
    {
      name: "Aros Argolla Sol",
      slug: "aros-argolla-sol",
      description: "Argollas texturadas en oro, livianas para uso diario.",
      material: "Oro 18k (baño)",
      gemstone: "",
      basePrice: 2900000,
      categoryId: aros?.id,
      featured: false,
      image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800",
      variants: [{ name: "Único", sku: "SOL-U", stock: 12 }],
    },
  ];

  for (const p of demo) {
    const { variants, image, ...data } = p;
    const created = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...data,
        images: { create: [{ url: image, alt: p.name, position: 0 }] },
        variants: { create: variants.map((v) => ({ ...v, priceDelta: 0 })) },
      },
    });
    console.log(`✔ Producto: ${created.name}`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
