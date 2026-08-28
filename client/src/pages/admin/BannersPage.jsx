import { useEffect, useState } from "react";
import api from "../../api/client";
import BannerForm from "../../components/admin/BannerForm";
import "./AdminShared.css";

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function loadData() {
    setLoading(true);
    api
      .get("/banners/admin/all")
      .then((res) => setBanners(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(loadData, []);

  function openCreate() {
    setEditingBanner(null);
    setShowForm(true);
  }

  function openEdit(banner) {
    setEditingBanner(banner);
    setShowForm(true);
  }

  async function handleSubmit(formData) {
    setSubmitting(true);
    try {
      if (editingBanner) {
        await api.put(`/banners/${editingBanner.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/banners", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setShowForm(false);
      loadData();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(banner) {
    if (!confirm(`¿Eliminar el banner "${banner.title || "sin título"}"?`)) return;
    await api.delete(`/banners/${banner.id}`);
    loadData();
  }

  async function handleToggle(banner) {
    await api.patch(`/banners/${banner.id}/toggle`);
    loadData();
  }

  return (
    <div>
      <div className="admin-toolbar">
        <h1 className="admin-page-title" style={{ margin: 0 }}>
          Banners del carrusel
        </h1>
        <button onClick={openCreate}>+ Nuevo banner</button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th></th>
              <th>Título</th>
              <th>Orden</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {banners.map((banner) => (
              <tr key={banner.id}>
                <td>
                  <img
                    className="admin-table__thumb"
                    src={banner.imageUrl}
                    alt={banner.title || "Banner"}
                  />
                </td>
                <td>{banner.title || <em>Sin título</em>}</td>
                <td>{banner.order}</td>
                <td>
                  <span
                    className={`admin-badge ${banner.isActive ? "is-active" : "is-inactive"}`}
                  >
                    {banner.isActive ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="admin-table__actions">
                  <button onClick={() => openEdit(banner)}>Editar</button>
                  <button onClick={() => handleToggle(banner)}>
                    {banner.isActive ? "Desactivar" : "Activar"}
                  </button>
                  <button className="admin-btn-danger" onClick={() => handleDelete(banner)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {banners.length === 0 && (
              <tr>
                <td colSpan={5}>No hay banners todavía.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {showForm && (
        <BannerForm
          banner={editingBanner}
          submitting={submitting}
          onCancel={() => setShowForm(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
