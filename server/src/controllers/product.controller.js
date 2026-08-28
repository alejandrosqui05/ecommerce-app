import { prisma } from "../config/prisma.js";
import { processAndUploadImage, deleteImage } from "../utils/imageProcessor.js";

// Público: lista solo productos activos, con filtro opcional por categoría/búsqueda
export async function listPublicProducts(req, res) {
  const { category, search } = req.query;

  const where = { isActive: true };
  if (category && category !== "all") {
    where.category = { slug: category };
  }
  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }

  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  res.json(products);
}

// Admin: lista todos los productos (activos e inactivos)
export async function listAdminProducts(req, res) {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  res.json(products);
}

export async function createProduct(req, res) {
  const { name, description, price, categoryId, code, sortOrder } = req.body;

  if (!name || !price || !categoryId) {
    return res.status(400).json({ error: "Nombre, precio y categoría son requeridos" });
  }

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    return res.status(400).json({ error: "Categoría inválida" });
  }

  let imageUrl = null;
  let imagePath = null;

  if (req.file) {
    const uploaded = await processAndUploadImage(req.file.buffer);
    imageUrl = uploaded.url;
    imagePath = uploaded.path;
  }

  const product = await prisma.product.create({
    data: {
      name,
      description: description || null,
      price,
      categoryId,
      imageUrl,
      imagePath,
      code: code ? code.trim() : null,
      sortOrder: sortOrder !== undefined && sortOrder !== "" ? Number(sortOrder) : 0,
    },
    include: { category: true },
  });

  res.status(201).json(product);
}

export async function updateProduct(req, res) {
  const { id } = req.params;
  const { name, description, price, categoryId, isActive, code, sortOrder } = req.body;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  const data = {};
  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description;
  if (price !== undefined) data.price = price;
  if (categoryId !== undefined) data.categoryId = categoryId;
  if (isActive !== undefined) data.isActive = isActive === "true" || isActive === true;
  if (code !== undefined) data.code = code ? code.trim() : null;
  if (sortOrder !== undefined && sortOrder !== "") data.sortOrder = Number(sortOrder);

  if (req.file) {
    const uploaded = await processAndUploadImage(req.file.buffer);
    data.imageUrl = uploaded.url;
    data.imagePath = uploaded.path;
    // eliminar la imagen anterior del bucket, no bloquea la respuesta si falla
    deleteImage(existing.imagePath).catch(() => {});
  }

  const product = await prisma.product.update({
    where: { id },
    data,
    include: { category: true },
  });

  res.json(product);
}

export async function deleteProduct(req, res) {
  const { id } = req.params;
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  await prisma.product.delete({ where: { id } });
  deleteImage(existing.imagePath).catch(() => {});

  res.status(204).send();
}

export async function bulkSetActive(req, res) {
  const { isActive, categoryId } = req.body;

  if (isActive === undefined) {
    return res.status(400).json({ error: "isActive es requerido" });
  }

  const where = categoryId ? { categoryId } : {};
  const result = await prisma.product.updateMany({
    where,
    data: { isActive: isActive === true || isActive === "true" },
  });

  res.json({ count: result.count });
}

export async function toggleAvailability(req, res) {
  const { id } = req.params;
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  const product = await prisma.product.update({
    where: { id },
    data: { isActive: !existing.isActive },
    include: { category: true },
  });

  res.json(product);
}
