import multer from "multer";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB de origen; se recomprime luego
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(new Error("Formato de imagen no soportado. Usa JPG, PNG, WEBP o GIF."));
    }
    cb(null, true);
  },
});
