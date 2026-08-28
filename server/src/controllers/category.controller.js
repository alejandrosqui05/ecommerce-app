import { prisma } from "../config/prisma.js";

const DIACRITICS_REGEX = new RegExp("[\\u0300-\\u036f]", "g");

function slugify(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS_REGEX, "")
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function listCategories(req, res) {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
  res.json(categories);
}

export async function createCategory(req, res) {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "El nombre es requerido" });
  }

  const slug = slugify(name);
  const existing = await prisma.category.findFirst({ where: { OR: [{ name }, { slug }] } });
  if (existing) {
    return res.status(409).json({ error: "Ya existe una categoría con ese nombre" });
  }

  const category = await prisma.category.create({ data: { name: name.trim(), slug } });
  res.status(201).json(category);
}

export async function updateCategory(req, res) {
  const { id } = req.params;
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "El nombre es requerido" });
  }

  try {
    const category = await prisma.category.update({
      where: { id },
      data: { name: name.trim(), slug: slugify(name) },
    });
    res.json(category);
  } catch {
    res.status(404).json({ error: "Categoría no encontrada" });
  }
}

export async function deleteCategory(req, res) {
  const { id } = req.params;
  const productsCount = await prisma.product.count({ where: { categoryId: id } });
  if (productsCount > 0) {
    return res.status(409).json({
      error: `No se puede eliminar: hay ${productsCount} producto(s) asociados a esta categoría`,
    });
  }

  try {
    await prisma.category.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Categoría no encontrada" });
  }
}
