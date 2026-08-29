-- Configuración editable de la tienda (correo, teléfono, ubicación) mostrada
-- en el footer público. Fila única (id fijo), editable solo por el admin
-- principal (no el editor de precios).

CREATE TABLE IF NOT EXISTS "StoreSettings" (
  id INTEGER PRIMARY KEY DEFAULT 1,
  "contactEmail" TEXT,
  "contactPhone" TEXT,
  "address" TEXT,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO "StoreSettings" (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE "StoreSettings" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "store_settings_public_select" ON "StoreSettings";
CREATE POLICY "store_settings_public_select" ON "StoreSettings" FOR SELECT USING (true);

DROP POLICY IF EXISTS "store_settings_admin_update" ON "StoreSettings";
CREATE POLICY "store_settings_admin_update" ON "StoreSettings" FOR UPDATE
  USING (auth.role() = 'authenticated');
