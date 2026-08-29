import { useEffect, useState } from "react";
import {
  listAdminProducts,
  listCategories,
  createProduct,
  updateProduct,
  updateProductPrice,
  deleteProduct,
  toggleProductActive,
  bulkSetProductsActive,
  subscribeToProductChanges,
} from "../../api/db";
import { useAuth } from "../../context/AuthContext";
import ProductForm from "../../components/admin/ProductForm";
import PriceEditForm from "../../components/admin/PriceEditForm";
import { formatPrice } from "../../utils/format";
import "./AdminShared.css";

export default function ProductsPage() {
  const { role } = useAuth();
  const isPriceEditor = role === "price_editor";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  function loadData() {
    setLoading(true);
    Promise.all([listAdminProducts(), listCategories()])
      .then(([productsList, categoriesList]) => {
        setProducts(productsList);
        setCategories(categoriesList);
      })
      .finally(() => setLoading(false));
  }

  useEffect(loadData, []);

  // Mantiene este panel sincronizado en vivo con el otro admin: si alguien
  // crea, edita o borra un producto desde otra sesión, la lista se refresca sola.
  useEffect(() => subscribeToProductChanges(() => loadData()), []);

  function openCreate() {
    setEditingProduct(null);
    setShowForm(true);
  }

  function openEdit(product) {
    setEditingProduct(product);
    setShowForm(true);
  }

  async function handleSubmit(formValues) {
    setSubmitting(true);
    try {
      if (editingProduct) {
        if (isPriceEditor) {
          await updateProductPrice(editingProduct.id, formValues);
        } else {
          await updateProduct(editingProduct.id, formValues, editingProduct.imagePath);
        }
      } else {
        await createProduct(formValues);
      }
      setShowForm(false);
      loadData();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(product) {
    if (!confirm(`¿Eliminar "${product.name}"?`)) return;
    await deleteProduct(product.id, product.imagePath);
    loadData();
  }

  async function handleToggle(product) {
    await toggleProductActive(product.id, product.isActive);
    loadData();
  }

  async function handleBulkSetActive(isActive) {
    const verb = isActive ? "activar" : "desactivar";
    if (!confirm(`¿Seguro que quieres ${verb} los ${products.length} productos?`)) return;

    setBulkLoading(true);
    try {
      await bulkSetProductsActive(isActive);
      loadData();
    } finally {
      setBulkLoading(false);
    }
  }

  return (
    <div>
      <div className="admin-toolbar">
        <h1 className="admin-page-title" style={{ margin: 0 }}>
          {isPriceEditor ? "Precios de productos" : "Productos"}
        </h1>
        {!isPriceEditor && (
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              className="admin-btn-secondary"
              disabled={bulkLoading || products.length === 0}
              onClick={() => handleBulkSetActive(true)}
            >
              Activar todos
            </button>
            <button
              className="admin-btn-secondary"
              disabled={bulkLoading || products.length === 0}
              onClick={() => handleBulkSetActive(false)}
            >
              Desactivar todos
            </button>
            <button onClick={openCreate}>+ Nuevo producto</button>
          </div>
        )}
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th></th>
              <th>Código</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <img
                    className="admin-table__thumb"
                    src={
                      product.imageUrl ||
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='42' height='42'%3E%3Crect width='42' height='42' fill='%23e5e7eb'/%3E%3C/svg%3E"
                    }
                    alt={product.name}
                  />
                </td>
                <td>{product.code || "—"}</td>
                <td>{product.name}</td>
                <td>{product.category?.name}</td>
                <td>{formatPrice(product.price)}</td>
                <td>
                  <span
                    className={`admin-badge ${product.isActive ? "is-active" : "is-inactive"}`}
                  >
                    {product.isActive ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="admin-table__actions">
                  {isPriceEditor ? (
                    <>
                      <button onClick={() => openEdit(product)}>Editar precio</button>
                      <button onClick={() => handleToggle(product)}>
                        {product.isActive ? "Desactivar" : "Activar"}
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => openEdit(product)}>Editar</button>
                      <button onClick={() => handleToggle(product)}>
                        {product.isActive ? "Desactivar" : "Activar"}
                      </button>
                      <button className="admin-btn-danger" onClick={() => handleDelete(product)}>
                        Eliminar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={7}>No hay productos todavía.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {showForm && isPriceEditor && (
        <PriceEditForm
          product={editingProduct}
          submitting={submitting}
          onCancel={() => setShowForm(false)}
          onSubmit={handleSubmit}
        />
      )}

      {showForm && !isPriceEditor && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          submitting={submitting}
          onCancel={() => setShowForm(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
