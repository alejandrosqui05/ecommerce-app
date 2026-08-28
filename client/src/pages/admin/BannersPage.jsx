import { useEffect, useState } from "react";
import {
  listAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerActive,
} from "../../api/db";
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
    listAdminBanners()
      .then(setBanners)
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

  async function handleSubmit(formValues) {
    setSubmitting(true);
    try {
      if (editingBanner) {
        await updateBanner(editingBanner.id, formValues, editingBanner.imagePath);
      } else {
        await createBanner(formValues);
      }
      setShowForm(false);
      loadData();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(banner) {
    if (!confirm(`¿Eliminar el banner "${banner.title || "sin título"}"?`)) return;
    await deleteBanner(banner.id, banner.imagePath);
    loadData();
  }

  async function handleToggle(banner) {
    await toggleBannerActive(banner.id, banner.isActive);
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
