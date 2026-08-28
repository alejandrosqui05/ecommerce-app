import "dotenv/config";
import { readFileSync } from "fs";
import { prisma } from "../src/config/prisma.js";
import { processAndUploadImage } from "../src/utils/imageProcessor.js";

const CATEGORY_SLUG = "conectores";
const CATEGORY_NAME = "Conectores";

async function ensureCategory() {
  const existing = await prisma.category.findUnique({ where: { slug: CATEGORY_SLUG } });
  if (existing) return existing;
  return prisma.category.create({ data: { name: CATEGORY_NAME, slug: CATEGORY_SLUG } });
}

async function loadImageBuffer(source) {
  if (source.startsWith("data:")) {
    const base64 = source.slice(source.indexOf(",") + 1);
    return Buffer.from(base64, "base64");
  }
  const res = await fetch(source, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function readJsonNoBom(url) {
  let text = readFileSync(url, "utf8");
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  return JSON.parse(text);
}

async function main() {
  const products = readJsonNoBom(new URL("../qualita-products.json", import.meta.url));
  const imgs = readJsonNoBom(new URL("../qualita-imgs.json", import.meta.url));

  const category = await ensureCategory();
  console.log(`Categoría destino: ${category.name} (${category.id})`);
  console.log(`Total productos a procesar: ${products.length}`);

  let created = 0;
  let skippedExisting = 0;
  let imageFailures = 0;

  for (let i = 0; i < products.length; i++) {
    const item = products[i];
    const name = (item.nombre || "").trim();
    console.log(`[${i + 1}/${products.length}] ${item.codigo} - ${name}`);
    if (!name) continue;

    const existing = await prisma.product.findFirst({
      where: { name, categoryId: category.id },
    });
    if (existing) {
      skippedExisting++;
      continue;
    }

    let imageUrl = null;
    let imagePath = null;

    const imgSource = imgs[item.codigo];
    if (imgSource && typeof imgSource === "string") {
      try {
        const buffer = await loadImageBuffer(imgSource);
        const uploaded = await processAndUploadImage(buffer);
        imageUrl = uploaded.url;
        imagePath = uploaded.path;
      } catch (err) {
        imageFailures++;
        console.warn(`  [img] falló ${item.codigo}: ${err.message}`);
      }
    }

    await prisma.product.create({
      data: {
        name,
        description: item.descripcion || null,
        price: 0,
        categoryId: category.id,
        imageUrl,
        imagePath,
        isActive: false,
      },
    });

    created++;
    if (created % 20 === 0) {
      console.log(`  progreso: ${created}/${products.length}`);
    }
  }

  console.log("---");
  console.log(`Creados: ${created}`);
  console.log(`Ya existían (omitidos): ${skippedExisting}`);
  console.log(`Fallos al descargar imagen (creados sin imagen): ${imageFailures}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
