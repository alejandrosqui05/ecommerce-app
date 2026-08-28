-- Row Level Security para exponer las tablas directamente vía Supabase (PostgREST)
-- a la clave pública (publishable/anon) del cliente, ahora que no hay backend Express
-- entre el navegador y la base de datos.
--
-- Incluye un rol restringido "price_editor": un segundo admin que solo puede
-- cambiar el precio y activar/desactivar productos existentes, nada más
-- (no puede crear/eliminar productos, ni tocar categorías o banners). Esa
-- restricción de columnas se aplica con un trigger a nivel de base de datos,
-- así que aunque alguien intente saltarse la interfaz, la base de datos lo bloquea.

ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Banner" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AdminUser" ENABLE ROW LEVEL SECURITY;

-- Helper: true si el usuario autenticado tiene el rol restringido de precios
CREATE OR REPLACE FUNCTION is_price_editor() RETURNS boolean
LANGUAGE sql STABLE AS $$
  SELECT COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'price_editor';
$$;

-- ---------- Product ----------

DROP POLICY IF EXISTS "product_public_select" ON "Product";
CREATE POLICY "product_public_select" ON "Product" FOR SELECT USING ("isActive" = true);

DROP POLICY IF EXISTS "product_admin_select" ON "Product";
CREATE POLICY "product_admin_select" ON "Product" FOR SELECT USING (auth.role() = 'authenticated');

-- Solo el admin principal (no el editor de precios) crea/elimina productos
DROP POLICY IF EXISTS "product_admin_insert" ON "Product";
CREATE POLICY "product_admin_insert" ON "Product" FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND NOT is_price_editor());

DROP POLICY IF EXISTS "product_admin_delete" ON "Product";
CREATE POLICY "product_admin_delete" ON "Product" FOR DELETE USING (auth.role() = 'authenticated' AND NOT is_price_editor());

-- Update: el admin principal puede editar todo; el editor de precios también
-- puede intentar el UPDATE, pero el trigger de abajo le bloquea cualquier
-- columna que no sea price/isActive.
DROP POLICY IF EXISTS "product_admin_update" ON "Product";
CREATE POLICY "product_admin_update" ON "Product" FOR UPDATE USING (auth.role() = 'authenticated');

DROP TRIGGER IF EXISTS trg_price_editor_restriction ON "Product";
DROP FUNCTION IF EXISTS enforce_price_editor_column_restriction();
CREATE OR REPLACE FUNCTION enforce_price_editor_column_restriction() RETURNS TRIGGER AS $$
BEGIN
  IF is_price_editor() THEN
    IF NEW.name IS DISTINCT FROM OLD.name
      OR NEW.description IS DISTINCT FROM OLD.description
      OR NEW."categoryId" IS DISTINCT FROM OLD."categoryId"
      OR NEW."imageUrl" IS DISTINCT FROM OLD."imageUrl"
      OR NEW."imagePath" IS DISTINCT FROM OLD."imagePath"
      OR NEW.code IS DISTINCT FROM OLD.code
      OR NEW."sortOrder" IS DISTINCT FROM OLD."sortOrder"
    THEN
      RAISE EXCEPTION 'El usuario de precios solo puede modificar el precio y el estado activo del producto';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_price_editor_restriction
BEFORE UPDATE ON "Product"
FOR EACH ROW EXECUTE FUNCTION enforce_price_editor_column_restriction();

-- ---------- Category (el editor de precios no toca categorías) ----------

DROP POLICY IF EXISTS "category_public_select" ON "Category";
CREATE POLICY "category_public_select" ON "Category" FOR SELECT USING (true);

DROP POLICY IF EXISTS "category_admin_insert" ON "Category";
CREATE POLICY "category_admin_insert" ON "Category" FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND NOT is_price_editor());

DROP POLICY IF EXISTS "category_admin_update" ON "Category";
CREATE POLICY "category_admin_update" ON "Category" FOR UPDATE USING (auth.role() = 'authenticated' AND NOT is_price_editor());

DROP POLICY IF EXISTS "category_admin_delete" ON "Category";
CREATE POLICY "category_admin_delete" ON "Category" FOR DELETE USING (auth.role() = 'authenticated' AND NOT is_price_editor());

-- ---------- Banner (el editor de precios tampoco toca banners) ----------

DROP POLICY IF EXISTS "banner_public_select" ON "Banner";
CREATE POLICY "banner_public_select" ON "Banner" FOR SELECT USING ("isActive" = true);

DROP POLICY IF EXISTS "banner_admin_select" ON "Banner";
CREATE POLICY "banner_admin_select" ON "Banner" FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "banner_admin_insert" ON "Banner";
CREATE POLICY "banner_admin_insert" ON "Banner" FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND NOT is_price_editor());

DROP POLICY IF EXISTS "banner_admin_update" ON "Banner";
CREATE POLICY "banner_admin_update" ON "Banner" FOR UPDATE USING (auth.role() = 'authenticated' AND NOT is_price_editor());

DROP POLICY IF EXISTS "banner_admin_delete" ON "Banner";
CREATE POLICY "banner_admin_delete" ON "Banner" FOR DELETE USING (auth.role() = 'authenticated' AND NOT is_price_editor());

-- AdminUser: ya no se usa (se migró a Supabase Auth). Sin policies = nadie
-- puede leerla/escribirla vía API con RLS activo (solo el service_role la toca).

-- ---------- Storage (solo el admin principal sube/borra imágenes) ----------

DROP POLICY IF EXISTS "storage_product_images_public_read" ON storage.objects;
CREATE POLICY "storage_product_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "storage_product_images_admin_insert" ON storage.objects;
CREATE POLICY "storage_product_images_admin_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated' AND NOT is_price_editor());

DROP POLICY IF EXISTS "storage_product_images_admin_update" ON storage.objects;
CREATE POLICY "storage_product_images_admin_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated' AND NOT is_price_editor());

DROP POLICY IF EXISTS "storage_product_images_admin_delete" ON storage.objects;
CREATE POLICY "storage_product_images_admin_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated' AND NOT is_price_editor());

-- ---------- Realtime: para que ambos paneles de admin se mantengan
-- sincronizados en vivo (cuando uno crea/edita un producto, el otro lo ve
-- aparecer sin recargar la página) ----------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'Product'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE "Product";
  END IF;
END $$;
