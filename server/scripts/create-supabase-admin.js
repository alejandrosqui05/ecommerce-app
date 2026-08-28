import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("Faltan variables en server/.env (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD)");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await supabase.auth.admin.createUser({
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
  email_confirm: true,
});

if (error) {
  if (error.message.includes("already been registered")) {
    console.log(`El usuario ${ADMIN_EMAIL} ya existe en Supabase Auth. No se hizo ningún cambio.`);
    process.exit(0);
  }
  console.error("Error creando el usuario admin:", error.message);
  process.exit(1);
}

console.log(`Usuario admin creado en Supabase Auth: ${data.user.email} (id: ${data.user.id})`);
