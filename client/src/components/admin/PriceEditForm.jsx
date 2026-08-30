import { useState } from "react";

export default function PriceEditForm({ product, onCancel, onSubmit, submitting }) {
  const [price, setPrice] = useState(product.price);
  const [originalPrice, setOriginalPrice] = useState(product.originalPrice ?? "");
  const [isActive, setIsActive] = useState(product.isActive);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await onSubmit({ price, originalPrice, isActive });
    } catch (err) {
      setError(err.message || "Error al guardar el precio");
    }
  }

  return (
    <div className="admin-modal__overlay" onClick={onCancel}>
      <form className="admin-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>Editar precio</h2>
        <p className="admin-login__subtitle" style={{ margin: "-0.5rem 0 0.5rem" }}>
          {product.name}
        </p>

        {error && <p className="admin-error">{error}</p>}

        <label className="admin-form-field">
          Precio
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            autoFocus
          />
        </label>

        <label className="admin-form-field">
          Precio original (antes del descuento) — opcional
          <input
            type="number"
            step="0.01"
            min="0"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            placeholder="Déjalo vacío si no hay descuento"
          />
        </label>
        <p style={{ margin: "-0.5rem 0 0.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          Si pones un precio original mayor al precio de arriba, el producto se muestra en oferta
          (precio en rojo y destacado) en la tienda.
        </p>

        <label className="admin-form-field" style={{ flexDirection: "row", alignItems: "center", gap: "0.5rem" }}>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Activo (visible en la tienda)
        </label>

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
