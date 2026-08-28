import { useEffect, useState } from "react";

const emptyForm = { title: "", subtitle: "", linkUrl: "", order: 0 };

export default function BannerForm({ banner, onCancel, onSubmit, submitting }) {
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (banner) {
      setForm({
        title: banner.title || "",
        subtitle: banner.subtitle || "",
        linkUrl: banner.linkUrl || "",
        order: banner.order ?? 0,
      });
      setPreview(banner.imageUrl || null);
    } else {
      setForm(emptyForm);
      setPreview(null);
    }
    setImageFile(null);
  }, [banner]);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!banner && !imageFile) {
      setError("La imagen del banner es requerida");
      return;
    }

    try {
      await onSubmit({
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        linkUrl: form.linkUrl.trim(),
        order: form.order,
        imageFile,
      });
    } catch (err) {
      setError(err.message || "Error al guardar el banner");
    }
  }

  return (
    <div className="admin-modal__overlay" onClick={onCancel}>
      <form className="admin-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>{banner ? "Editar banner" : "Nuevo banner"}</h2>

        {error && <p className="admin-error">{error}</p>}

        <label className="admin-form-field">
          Título (opcional, se superpone sobre la imagen)
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </label>

        <label className="admin-form-field">
          Subtítulo (opcional)
          <input
            type="text"
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          />
        </label>

        <label className="admin-form-field">
          Enlace al hacer clic (opcional, ej. /?category=camisas)
          <input
            type="text"
            value={form.linkUrl}
            onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
          />
        </label>

        <label className="admin-form-field">
          Orden (menor número aparece primero)
          <input
            type="number"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: e.target.value })}
          />
        </label>

        <label className="admin-form-field">
          Imagen (se ajustará automáticamente a 1920x600)
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </label>

        {preview && (
          <img
            src={preview}
            alt="Vista previa"
            style={{ width: "100%", aspectRatio: "1920/600", objectFit: "cover", borderRadius: 8 }}
          />
        )}

        <div className="admin-form-actions">
          <button type="button" className="admin-btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" disabled={submitting}>
            {submitting ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
