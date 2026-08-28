import "dotenv/config";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
const PRICE_EDITOR_EMAIL = process.argv[2] || "toisaacpetit+precios@gmail.com";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en server/.env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const password = crypto.randomBytes(9).toString("base64").replace(/[+/=]/g, "x") + "!9";

const { data, error } = await supabase.auth.admin.createUser({
  email: PRICE_EDITOR_EMAIL,
  password,
  email_confirm: true,
  app_metadata: { role: "price_editor" },
});

if (error) {
  console.error("Error creando el usuario de precios:", error.message);
  process.exit(1);
}

console.log(`Usuario de precios creado: ${data.user.email}`);
console.log(`Contraseña: ${password}`);
console.log(`Rol (app_metadata): ${JSON.stringify(data.user.app_metadata)}`);
