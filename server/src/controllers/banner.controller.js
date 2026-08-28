import { prisma } from "../config/prisma.js";
import { processAndUploadBannerImage, deleteImage } from "../utils/imageProcessor.js";

export async function listPublicBanners(req, res) {
  const banners = await prisma.banner.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
  res.json(banners);
}

export async function listAdminBanners(req, res) {
  const banners = await prisma.banner.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
  res.json(banners);
}

export async function createBanner(req, res) {
  const { title, subtitle, linkUrl, order } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "La imagen del banner es requerida" });
  }

  const uploaded = await processAndUploadBannerImage(req.file.buffer);

  const banner = await prisma.banner.create({
    data: {
      title: title || null,
      subtitle: subtitle || null,
      linkUrl: linkUrl || null,
      order: order ? Number(order) : 0,
      imageUrl: uploaded.url,
      imagePath: uploaded.path,
    },
  });

  res.status(201).json(banner);
}

export async function updateBanner(req, res) {
  const { id } = req.params;
  const { title, subtitle, linkUrl, order, isActive } = req.body;

  const existing = await prisma.banner.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: "Banner no encontrado" });
  }

  const data = {};
  if (title !== undefined) data.title = title || null;
  if (subtitle !== undefined) data.subtitle = subtitle || null;
  if (linkUrl !== undefined) data.linkUrl = linkUrl || null;
  if (order !== undefined) data.order = Number(order);
  if (isActive !== undefined) data.isActive = isActive === "true" || isActive === true;

  if (req.file) {
    const uploaded = await processAndUploadBannerImage(req.file.buffer);
    data.imageUrl = uploaded.url;
    data.imagePath = uploaded.path;
    deleteImage(existing.imagePath).catch(() => {});
  }

  const banner = await prisma.banner.update({ where: { id }, data });
  res.json(banner);
}

export async function deleteBanner(req, res) {
  const { id } = req.params;
  const existing = await prisma.banner.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: "Banner no encontrado" });
  }

  await prisma.banner.delete({ where: { id } });
  deleteImage(existing.imagePath).catch(() => {});

  res.status(204).send();
}

export async function toggleBannerActive(req, res) {
  const { id } = req.params;
  const existing = await prisma.banner.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: "Banner no encontrado" });
  }

  const banner = await prisma.banner.update({
    where: { id },
    data: { isActive: !existing.isActive },
  });

  res.json(banner);
}
