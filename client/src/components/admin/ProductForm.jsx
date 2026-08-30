import { useEffect, useState } from "react";

const emptyForm = { name: "", description: "", price: "", originalPrice: "", categoryId: "", code: "" };

export default function ProductForm({ product, categories, onCancel, onSubmit, submitting }) {
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        description: product.description || "",
        price: product.price,
        originalPrice: product.originalPrice ?? "",
        categoryId: product.categoryId,
        code: product.code || "",
      });
      setPreview(product.imageUrl || null);
    } else {
      setForm(emptyForm);
      setPreview(null);
    }
    setImageFile(null);
  }, [product]);

  const selectedCategory = categories.find((cat) => cat.id === form.categoryId);
  const isConectores = selectedCategory?.slug === "conectores";

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.price || !form.categoryId) {
      setError("Nombre, precio y categoría son requeridos");
      return;
    }

    try {
      await onSubmit({
        name: form.name.trim(),
        description: form.description.trim(),
        price: form.price,
        originalPrice: form.originalPrice,
        categoryId: form.categoryId,
        code: isConectores ? form.code.trim() : "",
        imageFile,
      });
    } catch (err) {
      setError(err.message || "Error al guardar el producto");
    }
  }

  return (
    <div className="admin-modal__overlay" onClick={onCancel}>
      <form className="admin-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>{product ? "Editar producto" : "Nuevo producto"}</h2>

        {error && <p className="admin-error">{error}</p>}

        <label className="admin-form-field">
          Nombre
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </label>

        <label className="admin-form-field">
          Descripción
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>

        <label className="admin-form-field">
          Precio original — opcional
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.originalPrice}
            onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
            placeholder="Déjalo vacío si no hay descuento"
          />
        </label>

        <label className="admin-form-field">
          Precio de descuento
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />
        </label>

        <label className="admin-form-field">
          Categoría
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            required
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </label>

        {isConectores && (
          <label className="admin-form-field">
            Código
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="Ej. 233, R002"
            />
          </label>
        )}

        <label className="admin-form-field">
          Imagen (se convertirá automáticamente a WebP 800x800)
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </label>

        {preview && (
          <img
            src={preview}
            alt="Vista previa"
            style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 8 }}
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
