import { supabase } from "./supabase";

const STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || "product-images";
const WEBP_QUALITY = 0.8;

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function canvasToWebpBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("No se pudo generar la imagen WebP"))),
      "image/webp",
      WEBP_QUALITY
    );
  });
}

// Redimensiona manteniendo proporción, sin recortar (como sharp fit: "inside").
async function resizeContain(file, maxWidth, maxHeight) {
  const img = await loadImage(file);
  const ratio = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
  const width = Math.round(img.width * ratio);
  const height = Math.round(img.height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d").drawImage(img, 0, 0, width, height);

  return canvasToWebpBlob(canvas);
}

// Redimensiona y recorta al tamaño exacto, centrado (como sharp fit: "cover").
async function resizeCover(file, width, height) {
  const img = await loadImage(file);
  const scale = Math.max(width / img.width, height / img.height);
  const scaledWidth = img.width * scale;
  const scaledHeight = img.height * scale;
  const offsetX = (scaledWidth - width) / 2;
  const offsetY = (scaledHeight - height) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas
    .getContext("2d")
    .drawImage(img, -offsetX, -offsetY, scaledWidth, scaledHeight);

  return canvasToWebpBlob(canvas);
}

async function uploadWebpBlob(blob, folder) {
  const path = `${folder}/${crypto.randomUUID()}.webp`;

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, blob, {
    contentType: "image/webp",
    cacheControl: "31536000",
    upsert: false,
  });

  if (error) {
    throw new Error(`Error subiendo imagen a Supabase Storage: ${error.message}`);
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

export async function uploadProductImage(file) {
  const blob = await resizeContain(file, 800, 800);
  return uploadWebpBlob(blob, "products");
}

export async function uploadBannerImage(file) {
  const blob = await resizeCover(file, 1920, 600);
  return uploadWebpBlob(blob, "banners");
}

export async function deleteImage(path) {
  if (!path) return;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);
  if (error) {
    console.warn(`No se pudo eliminar la imagen ${path}: ${error.message}`);
  }
}
