import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    "[supabase] Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el .env — la subida de imágenes fallará."
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "product-images";
