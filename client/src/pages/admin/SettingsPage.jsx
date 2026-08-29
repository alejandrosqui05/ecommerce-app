import { useEffect, useState } from "react";
import { getStoreSettings, updateStoreSettings } from "../../api/db";
import "./AdminShared.css";

export default function SettingsPage() {
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getStoreSettings()
      .then((settings) => {
        setContactEmail(settings.contactEmail || "");
        setContactPhone(settings.contactPhone || "");
        setAddress(settings.address || "");
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      await updateStoreSettings({ contactEmail, contactPhone, address });
      setSaved(true);
    } catch (err) {
      setError(err.message || "Error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Cargando...</p>;

  return (
    <div>
      <h1 className="admin-page-title">Configuración</h1>
      <p>Esta información se muestra al final de la página principal de la tienda.</p>

      <form className="admin-inline-form" onSubmit={handleSubmit} style={{ flexDirection: "column", alignItems: "stretch", maxWidth: 420 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          Correo de contacto
          <input
            type="email"
            placeholder="correo@ejemplo.com"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          Teléfono
          <input
            type="text"
            placeholder="+58 412 1234567"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          Ubicación
          <input
            type="text"
            placeholder="Ciudad, país"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </label>
        <button type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </form>
      {error && <p className="admin-error">{error}</p>}
      {saved && <p style={{ color: "#15803d" }}>Guardado correctamente.</p>}
    </div>
  );
}
