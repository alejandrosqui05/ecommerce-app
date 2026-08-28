import sharp from "sharp";
import { randomUUID } from "crypto";
import { supabase, STORAGE_BUCKET } from "../config/supabase.js";

const PRODUCT_MAX_DIMENSION = 800;
const BANNER_WIDTH = 1920;
const BANNER_HEIGHT = 600;
const WEBP_QUALITY = 80;

async function uploadWebpBuffer(webpBuffer, folder) {
  const path = `${folder}/${randomUUID()}.webp`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, webpBuffer, {
      contentType: "image/webp",
      cacheControl: "31536000", // 1 año, el CDN lo respeta
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Error subiendo imagen a Supabase Storage: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return { url: publicUrlData.publicUrl, path };
}

/**
 * Convierte el buffer de imagen recibido a WebP (calidad 80), redimensionado
 * a un máximo de 800x800 (sin recortar, mantiene proporción), y lo sube
 * al bucket de Supabase Storage. Supabase sirve los objetos públicos vía CDN.
 */
export async function processAndUploadImage(fileBuffer, { folder = "products" } = {}) {
  const webpBuffer = await sharp(fileBuffer)
    .rotate() // corrige orientación EXIF
    .resize({
      width: PRODUCT_MAX_DIMENSION,
      height: PRODUCT_MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  return uploadWebpBuffer(webpBuffer, folder);
}

/**
 * Igual que processAndUploadImage, pero fuerza siempre el tamaño exacto
 * 1920x600 (recorta el excedente centrado si la proporción no coincide),
 * pensado para los banners del carrusel.
 */
export async function processAndUploadBannerImage(fileBuffer, { folder = "banners" } = {}) {
  const webpBuffer = await sharp(fileBuffer)
    .rotate()
    .resize({
      width: BANNER_WIDTH,
      height: BANNER_HEIGHT,
      fit: "cover",
      position: "center",
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  return uploadWebpBuffer(webpBuffer, folder);
}

export async function deleteImage(path) {
  if (!path) return;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);
  if (error) {
    console.warn(`[imageProcessor] No se pudo eliminar la imagen ${path}: ${error.message}`);
  }
}
