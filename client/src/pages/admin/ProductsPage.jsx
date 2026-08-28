import { useEffect, useState } from "react";
import api from "../../api/client";
import ProductForm from "../../components/admin/ProductForm";
import { formatPrice } from "../../utils/format";
import "./AdminShared.css";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  function loadData() {
    setLoading(true);
    Promise.all([api.get("/products/admin/all"), api.get("/categories")])
      .then(([productsRes, categoriesRes]) => {
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      })
      .finally(() => setLoading(false));
  }

  useEffect(loadData, []);

  function openCreate() {
    setEditingProduct(null);
    setShowForm(true);
  }

  function openEdit(product) {
    setEditingProduct(product);
    setShowForm(true);
  }

  async function handleSubmit(formData) {
    setSubmitting(true);
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setShowForm(false);
      loadData();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(product) {
    if (!confirm(`¿Eliminar "${product.name}"?`)) return;
    await api.delete(`/products/${product.id}`);
    loadData();
  }

  async function handleToggle(product) {
    await api.patch(`/products/${product.id}/toggle`);
    loadData();
  }

  async function handleBulkSetActive(isActive) {
    const verb = isActive ? "activar" : "desactivar";
    if (!confirm(`¿Seguro que quieres ${verb} los ${products.length} productos?`)) return;

    setBulkLoading(true);
    try {
      await api.patch("/products/bulk", { isActive });
      loadData();
    } finally {
      setBulkLoading(false);
    }
  }

  return (
    <div>
      <div className="admin-toolbar">
        <h1 className="admin-page-title" style={{ margin: 0 }}>
          Productos
        </h1>
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
                  <button onClick={() => openEdit(product)}>Editar</button>
                  <button onClick={() => handleToggle(product)}>
                    {product.isActive ? "Desactivar" : "Activar"}
                  </button>
                  <button className="admin-btn-danger" onClick={() => handleDelete(product)}>
                    Eliminar
                  </button>
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

      {showForm && (
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
