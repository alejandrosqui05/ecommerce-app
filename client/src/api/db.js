import { supabase } from "../utils/supabase";
import { slugify } from "../utils/slugify";
import { uploadProductImage, uploadBannerImage, deleteImage } from "../utils/imageUpload";

const PRODUCT_SELECT = "*, category:Category(*)";

function mapProduct(row) {
  if (!row) return row;
  const { category, ...rest } = row;
  return { ...rest, category };
}

// ---------- Productos ----------

export async function listPublicProducts({ category, search } = {}) {
  let query = supabase
    .from("Product")
    .select(category && category !== "all" ? "*, category:Category!inner(*)" : PRODUCT_SELECT)
    .eq("isActive", true);

  if (category && category !== "all") {
    query = query.eq("category.slug", category);
  }
  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  query = query.order("sortOrder", { ascending: true }).order("createdAt", { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return data.map(mapProduct);
}

export async function listAdminProducts() {
  const { data, error } = await supabase
    .from("Product")
    .select(PRODUCT_SELECT)
    .order("sortOrder", { ascending: true })
    .order("createdAt", { ascending: false });
  if (error) throw error;
  return data.map(mapProduct);
}

export async function createProduct({ name, description, price, categoryId, code, sortOrder, imageFile }) {
  let imageUrl = null;
  let imagePath = null;
  if (imageFile) {
    const uploaded = await uploadProductImage(imageFile);
    imageUrl = uploaded.url;
    imagePath = uploaded.path;
  }

  const { data, error } = await supabase
    .from("Product")
    .insert({
      name,
      description: description || null,
      price,
      categoryId,
      code: code ? code.trim() : null,
      sortOrder: sortOrder !== undefined && sortOrder !== "" ? Number(sortOrder) : 0,
      imageUrl,
      imagePath,
      updatedAt: new Date().toISOString(),
    })
    .select(PRODUCT_SELECT)
    .single();

  if (error) throw error;
  return mapProduct(data);
}

export async function updateProduct(id, { name, description, price, categoryId, isActive, code, sortOrder, imageFile }, previousImagePath) {
  const patch = { updatedAt: new Date().toISOString() };
  if (name !== undefined) patch.name = name;
  if (description !== undefined) patch.description = description || null;
  if (price !== undefined) patch.price = price;
  if (categoryId !== undefined) patch.categoryId = categoryId;
  if (isActive !== undefined) patch.isActive = isActive;
  if (code !== undefined) patch.code = code ? code.trim() : null;
  if (sortOrder !== undefined && sortOrder !== "") patch.sortOrder = Number(sortOrder);

  if (imageFile) {
    const uploaded = await uploadProductImage(imageFile);
    patch.imageUrl = uploaded.url;
    patch.imagePath = uploaded.path;
    deleteImage(previousImagePath).catch(() => {});
  }

  const { data, error } = await supabase
    .from("Product")
    .update(patch)
    .eq("id", id)
    .select(PRODUCT_SELECT)
    .single();

  if (error) throw error;
  return mapProduct(data);
}

export async function deleteProduct(id, imagePath) {
  const { error } = await supabase.from("Product").delete().eq("id", id);
  if (error) throw error;
  deleteImage(imagePath).catch(() => {});
}

// Usada por la cuenta restringida de "editor de precios": la base de datos
// (trigger) rechaza cualquier columna distinta a price/isActive aunque se
// mande algo más desde aquí, así que esta función solo expone esas dos.
export async function updateProductPrice(id, { price, isActive }) {
  const { data, error } = await supabase
    .from("Product")
    .update({ price, isActive, updatedAt: new Date().toISOString() })
    .eq("id", id)
    .select(PRODUCT_SELECT)
    .single();
  if (error) throw error;
  return mapProduct(data);
}

export function subscribeToProductChanges(onChange) {
  const channel = supabase
    .channel("products-admin-sync")
    .on("postgres_changes", { event: "*", schema: "public", table: "Product" }, onChange)
    .subscribe();

  return () => supabase.removeChannel(channel);
}

export async function toggleProductActive(id, currentIsActive) {
  const { data, error } = await supabase
    .from("Product")
    .update({ isActive: !currentIsActive, updatedAt: new Date().toISOString() })
    .eq("id", id)
    .select(PRODUCT_SELECT)
    .single();
  if (error) throw error;
  return mapProduct(data);
}

export async function bulkSetProductsActive(isActive, categoryId) {
  let query = supabase
    .from("Product")
    .update({ isActive, updatedAt: new Date().toISOString() }, { count: "exact" });
  query = categoryId ? query.eq("categoryId", categoryId) : query.not("id", "is", null);
  const { error, count } = await query;
  if (error) throw error;
  return count;
}

// ---------- Categorías ----------

export async function listCategories() {
  const { data, error } = await supabase
    .from("Category")
    .select("*, Product(count)")
    .order("name", { ascending: true });
  if (error) throw error;
  return data.map((cat) => ({
    ...cat,
    Product: undefined,
    _count: { products: cat.Product?.[0]?.count ?? 0 },
  }));
}

export async function createCategory(name) {
  const slug = slugify(name);
  const { data, error } = await supabase
    .from("Category")
    .insert({ name: name.trim(), slug, updatedAt: new Date().toISOString() })
    .select()
    .single();
  if (error) {
    if (error.code === "23505") throw new Error("Ya existe una categoría con ese nombre");
    throw error;
  }
  return data;
}

export async function updateCategory(id, name) {
  const { data, error } = await supabase
    .from("Category")
    .update({ name: name.trim(), slug: slugify(name), updatedAt: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) {
    if (error.code === "23505") throw new Error("Ya existe una categoría con ese nombre");
    throw error;
  }
  return data;
}

export async function deleteCategory(id) {
  const { count, error: countError } = await supabase
    .from("Product")
    .select("id", { count: "exact", head: true })
    .eq("categoryId", id);
  if (countError) throw countError;
  if (count > 0) {
    throw new Error(`No se puede eliminar: hay ${count} producto(s) asociados a esta categoría`);
  }

  const { error } = await supabase.from("Category").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Banners ----------

export async function listPublicBanners() {
  const { data, error } = await supabase
    .from("Banner")
    .select("*")
    .eq("isActive", true)
    .order("order", { ascending: true })
    .order("createdAt", { ascending: false });
  if (error) throw error;
  return data;
}

export async function listAdminBanners() {
  const { data, error } = await supabase
    .from("Banner")
    .select("*")
    .order("order", { ascending: true })
    .order("createdAt", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createBanner({ title, subtitle, linkUrl, order, imageFile }) {
  if (!imageFile) throw new Error("La imagen del banner es requerida");
  const uploaded = await uploadBannerImage(imageFile);

  const { data, error } = await supabase
    .from("Banner")
    .insert({
      title: title || null,
      subtitle: subtitle || null,
      linkUrl: linkUrl || null,
      order: order ? Number(order) : 0,
      imageUrl: uploaded.url,
      imagePath: uploaded.path,
      updatedAt: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBanner(id, { title, subtitle, linkUrl, order, isActive, imageFile }, previousImagePath) {
  const patch = { updatedAt: new Date().toISOString() };
  if (title !== undefined) patch.title = title || null;
  if (subtitle !== undefined) patch.subtitle = subtitle || null;
  if (linkUrl !== undefined) patch.linkUrl = linkUrl || null;
  if (order !== undefined) patch.order = Number(order);
  if (isActive !== undefined) patch.isActive = isActive;

  if (imageFile) {
    const uploaded = await uploadBannerImage(imageFile);
    patch.imageUrl = uploaded.url;
    patch.imagePath = uploaded.path;
    deleteImage(previousImagePath).catch(() => {});
  }

  const { data, error } = await supabase.from("Banner").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteBanner(id, imagePath) {
  const { error } = await supabase.from("Banner").delete().eq("id", id);
  if (error) throw error;
  deleteImage(imagePath).catch(() => {});
}

export async function toggleBannerActive(id, currentIsActive) {
  const { data, error } = await supabase
    .from("Banner")
    .update({ isActive: !currentIsActive, updatedAt: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ---------- Configuración de la tienda ----------

export async function getStoreSettings() {
  const { data, error } = await supabase.from("StoreSettings").select("*").eq("id", 1).single();
  if (error) throw error;
  return data;
}

export async function updateStoreSettings({ contactEmail, contactPhone, address }) {
  const { data, error } = await supabase
    .from("StoreSettings")
    .update({
      contactEmail: contactEmail || null,
      contactPhone: contactPhone || null,
      address: address || null,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", 1)
    .select()
    .single();
  if (error) throw error;
  return data;
}
