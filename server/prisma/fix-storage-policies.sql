-- Políticas de almacenamiento para el bucket "product-images": nunca se
-- habían creado, por eso las subidas de imágenes fallaban con
-- "row violates row-level security policy".

DROP POLICY IF EXISTS "storage_product_images_public_read" ON storage.objects;
CREATE POLICY "storage_product_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "storage_product_images_admin_insert" ON storage.objects;
CREATE POLICY "storage_product_images_admin_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "storage_product_images_admin_update" ON storage.objects;
CREATE POLICY "storage_product_images_admin_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "storage_product_images_admin_delete" ON storage.objects;
CREATE POLICY "storage_product_images_admin_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
