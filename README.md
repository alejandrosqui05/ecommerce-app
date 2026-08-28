# Mi Tienda — E-commerce (Tienda pública + Panel Admin)

Proyecto full-stack: `client` (React + Vite) y `server` (Node/Express + Prisma + Supabase).

## Estructura

```
ecommerce-app/
  client/   -> Tienda pública + Panel de administración (React, react-router)
  server/   -> API REST (Express, Prisma/PostgreSQL, Supabase Storage, sharp)
```

## 1. Configurar Supabase (Base de datos + Storage/CDN)

1. Crea un proyecto en https://supabase.com.
2. En **Project Settings > Database**, copia la "Connection string" (modo *Transaction* o *Session*) para `DATABASE_URL`.
3. En **Project Settings > API**, copia `Project URL` (→ `SUPABASE_URL`) y el `service_role key` (→ `SUPABASE_SERVICE_ROLE_KEY`). **Nunca expongas esta key en el cliente.**
4. En **Storage**, crea un bucket llamado `product-images` y márcalo como **público** (para que `getPublicUrl` sirva las imágenes directamente vía el CDN de Supabase). Si prefieres otro nombre, ajusta `SUPABASE_STORAGE_BUCKET` en el `.env`.

## 2. Backend (server/)

```powershell
cd server
copy .env.example .env
# Edita .env con tus credenciales de Supabase y un JWT_SECRET propio

npm install
npx prisma migrate dev --name init   # crea las tablas en la base de datos
npm run prisma:generate
node prisma/seed.js                   # crea el usuario admin y categorías de ejemplo

npm run dev                           # http://localhost:4000
```

El seed crea un admin con las credenciales definidas en `ADMIN_EMAIL` / `ADMIN_PASSWORD` del `.env` (por defecto `admin@example.com` / `ChangeMe123!`). Cámbialas antes de desplegar.

## 3. Frontend (client/)

```powershell
cd client
copy .env.example .env
# VITE_API_URL debe apuntar al backend, por defecto http://localhost:4000/api

npm install
npm run dev                           # http://localhost:5173
```

- Tienda pública: `http://localhost:5173/`
- Panel admin: `http://localhost:5173/admin/login`

### Botón de WhatsApp

Edita `client/.env`:

- `VITE_WHATSAPP_NUMBER`: número de la tienda en formato internacional, solo dígitos (ej. `5215512345678`).
- `VITE_WHATSAPP_GREETING`: mensaje de saludo del botón flotante de contacto.

Con esto configurado:
- Aparece un botón flotante de WhatsApp en la tienda para consultas generales.
- El botón "Finalizar compra" del carrito abre WhatsApp con un mensaje generado dinámicamente a partir de los productos, cantidades y total del carrito.

Si `VITE_WHATSAPP_NUMBER` no está configurado, el botón flotante no se muestra y "Finalizar compra" queda deshabilitado.

## Pipeline de imágenes

Al crear/editar un producto con imagen desde el Admin:

1. El archivo llega al backend en memoria (multer).
2. `sharp` lo convierte a **WebP calidad 80**, redimensionado a máx **800x800px** (mantiene proporción, sin recortar).
3. Se sube el `.webp` al bucket de **Supabase Storage** (`SUPABASE_STORAGE_BUCKET`).
4. Se guarda en la base de datos la URL pública, que Supabase sirve a través de su **CDN** con cache de 1 año (`cacheControl`).

Ver [server/src/utils/imageProcessor.js](server/src/utils/imageProcessor.js).

## Notas de producción

- Cambia `JWT_SECRET` y las credenciales del admin antes de desplegar.
- Considera migrar `ADMIN_PASSWORD` inicial y rotar la contraseña desde una futura pantalla de "cambiar contraseña" (no incluida en este alcance).
- El bucket de Storage debe ser público solo para lectura; las subidas siempre pasan por el backend autenticado (nunca directo desde el cliente).
