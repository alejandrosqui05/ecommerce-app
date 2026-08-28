import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, name: "Administrador" },
  });

  const categories = ["Camisas", "Pantalones", "Zapatos", "Accesorios"];
  for (const name of categories) {
    const slug = name.toLowerCase();
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
  }

  console.log(`Admin listo -> email: ${email} / password: ${password}`);
  console.log("Categorías de ejemplo creadas.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
