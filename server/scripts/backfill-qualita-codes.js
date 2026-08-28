import "dotenv/config";
import { readFileSync } from "fs";
import { prisma } from "../src/config/prisma.js";

const CATEGORY_SLUG = "conectores";

function readJsonNoBom(url) {
  let text = readFileSync(url, "utf8");
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  return JSON.parse(text);
}

async function main() {
  const products = readJsonNoBom(new URL("../qualita-products.json", import.meta.url));

  const category = await prisma.category.findUnique({ where: { slug: CATEGORY_SLUG } });
  if (!category) throw new Error("Categoría Conectores no encontrada");

  // Reconstruye, en el mismo orden del catálogo fuente, el nombre exacto
  // que el importador original guardó en la base para cada código:
  // - primera aparición de un nombre -> se guardó tal cual
  // - apariciones repetidas del mismo nombre -> se guardó como "Nombre (Cód. X)"
  const seenNames = new Set();
  const expected = products.map((item, index) => {
    const name = (item.nombre || "").trim();
    const isDuplicate = seenNames.has(name);
    seenNames.add(name);
    const dbName = isDuplicate ? `${name} (Cód. ${item.codigo})` : name;
    return { code: String(item.codigo), dbName, sortOrder: index + 1 };
  });

  const dbProducts = await prisma.product.findMany({ where: { categoryId: category.id } });
  const byName = new Map();
  for (const p of dbProducts) {
    if (!byName.has(p.name)) byName.set(p.name, []);
    byName.get(p.name).push(p);
  }

  let updated = 0;
  let notFound = [];
  for (const item of expected) {
    const bucket = byName.get(item.dbName);
    const product = bucket?.shift();
    if (!product) {
      notFound.push(item);
      continue;
    }
    await prisma.product.update({
      where: { id: product.id },
      data: { code: item.code, sortOrder: item.sortOrder },
    });
    updated++;
  }

  console.log(`Actualizados: ${updated}/${expected.length}`);
  if (notFound.length) {
    console.log("No encontrados en la base de datos:");
    notFound.forEach((n) => console.log(`  ${n.code} - ${n.dbName}`));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
