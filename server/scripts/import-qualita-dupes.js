import "dotenv/config";
import { readFileSync } from "fs";
import { prisma } from "../src/config/prisma.js";
import { processAndUploadImage } from "../src/utils/imageProcessor.js";

const CATEGORY_SLUG = "conectores";

// Códigos que quedaron fuera de la primera pasada por compartir nombre con otro producto
const DUPLICATE_CODES = new Set([
  "2", "69", "60", "34", "40", "50", "56", "66", "76", "82",
  "109", "114", "122", "129", "132", "135", "136", "182", "188", "226",
]);

function readJsonNoBom(url) {
  let text = readFileSync(url, "utf8");
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  return JSON.parse(text);
}

async function loadImageBuffer(source) {
  if (source.startsWith("data:")) {
    return Buffer.from(source.slice(source.indexOf(",") + 1), "base64");
  }
  const res = await fetch(source, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const products = readJsonNoBom(new URL("../qualita-products.json", import.meta.url));
  const imgs = readJsonNoBom(new URL("../qualita-imgs.json", import.meta.url));

  const category = await prisma.category.findUnique({ where: { slug: CATEGORY_SLUG } });
  if (!category) throw new Error("Categoría Conectores no encontrada");

  const targets = products.filter((p) => DUPLICATE_CODES.has(String(p.codigo)));
  console.log(`Reimportando ${targets.length} productos duplicados por nombre...`);

  let created = 0;
  for (const item of targets) {
    const name = `${item.nombre.trim()} (Cód. ${item.codigo})`;

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
    console.log(`  [${created}/${targets.length}] ${name}`);
  }

  console.log(`Listo. Creados: ${created}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
