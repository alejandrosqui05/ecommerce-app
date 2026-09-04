-- Links de redes sociales, editables desde el admin. Si están vacíos, el
-- ícono correspondiente no se muestra en la tienda.
ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "instagramUrl" TEXT;
ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "facebookUrl" TEXT;
ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "tiktokUrl" TEXT;
