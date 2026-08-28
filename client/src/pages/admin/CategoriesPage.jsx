import { useEffect, useState } from "react";
import api from "../../api/client";
import "./AdminShared.css";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  function loadCategories() {
    setLoading(true);
    api
      .get("/categories")
      .then((res) => setCategories(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(loadCategories, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return;

    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, { name });
      } else {
        await api.post("/categories", { name });
      }
      setName("");
      setEditingId(null);
      loadCategories();
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar la categoría");
    }
  }

  function handleEdit(category) {
    setEditingId(category.id);
    setName(category.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setName("");
    setError("");
  }

  async function handleDelete(category) {
    if (!confirm(`¿Eliminar la categoría "${category.name}"?`)) return;
    try {
      await api.delete(`/categories/${category.id}`);
      loadCategories();
    } catch (err) {
      alert(err.response?.data?.error || "Error al eliminar");
    }
  }

  return (
    <div>
      <h1 className="admin-page-title">Categorías</h1>

      <form className="admin-inline-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre de la categoría"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">{editingId ? "Guardar" : "Crear"}</button>
        {editingId && (
          <button type="button" className="admin-btn-secondary" onClick={cancelEdit}>
            Cancelar
          </button>
        )}
      </form>
      {error && <p className="admin-error">{error}</p>}

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Productos</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td>{cat.name}</td>
                <td>{cat._count?.products ?? 0}</td>
                <td className="admin-table__actions">
                  <button onClick={() => handleEdit(cat)}>Editar</button>
                  <button className="admin-btn-danger" onClick={() => handleDelete(cat)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={3}>No hay categorías todavía.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
