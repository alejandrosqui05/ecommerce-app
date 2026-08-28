import "dotenv/config";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
const OLD_EMAIL = "toisaacpetit+precios@gmail.com";
const NEW_EMAIL = process.argv[2] || "wildaradmin@wildrarca.lovestoblog.com";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en server/.env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: list, error: listError } = await supabase.auth.admin.listUsers();
if (listError) {
  console.error("Error listando usuarios:", listError.message);
  process.exit(1);
}

const oldUser = list.users.find((u) => u.email === OLD_EMAIL);
if (oldUser) {
  const { error: deleteError } = await supabase.auth.admin.deleteUser(oldUser.id);
  if (deleteError) {
    console.error("Error eliminando el usuario anterior:", deleteError.message);
    process.exit(1);
  }
  console.log(`Usuario anterior eliminado: ${OLD_EMAIL}`);
}

const password = crypto.randomBytes(9).toString("base64").replace(/[+/=]/g, "x") + "!9";

const { data, error } = await supabase.auth.admin.createUser({
  email: NEW_EMAIL,
  password,
  email_confirm: true,
  app_metadata: { role: "price_editor" },
});

if (error) {
  console.error("Error creando el nuevo usuario de precios:", error.message);
  process.exit(1);
}

console.log(`Usuario de precios creado: ${data.user.email}`);
console.log(`Contraseña: ${password}`);
console.log(`Rol (app_metadata): ${JSON.stringify(data.user.app_metadata)}`);
