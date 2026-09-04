import { useEffect, useState } from "react";
import { getStoreSettings, updateStoreSettings } from "../../api/db";
import "./AdminShared.css";

const FIELD_STYLE = { display: "flex", flexDirection: "column", gap: "0.3rem" };

export default function SettingsPage() {
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
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
        setInstagramUrl(settings.instagramUrl || "");
        setFacebookUrl(settings.facebookUrl || "");
        setTiktokUrl(settings.tiktokUrl || "");
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      await updateStoreSettings({
        contactEmail,
        contactPhone,
        address,
        instagramUrl,
        facebookUrl,
        tiktokUrl,
      });
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
      <p>Esta información se muestra en la página principal de la tienda.</p>

      <form className="admin-inline-form" onSubmit={handleSubmit} style={{ flexDirection: "column", alignItems: "stretch", maxWidth: 420 }}>
        <label style={FIELD_STYLE}>
          Correo de contacto
          <input
            type="email"
            placeholder="correo@ejemplo.com"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
        </label>
        <label style={FIELD_STYLE}>
          Teléfono
          <input
            type="text"
            placeholder="+58 412 1234567"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
        </label>
        <label style={FIELD_STYLE}>
          Ubicación
          <input
            type="text"
            placeholder="Ciudad, país"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </label>

        <hr style={{ width: "100%", border: "none", borderTop: "1px solid var(--border-color)", margin: "0.5rem 0" }} />
        <p style={{ margin: 0, fontWeight: 600 }}>Redes sociales</p>
        <p style={{ margin: "-0.4rem 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          Deja vacío el que no tengas todavía — su ícono no se muestra en la tienda hasta que
          pongas el link.
        </p>

        <label style={FIELD_STYLE}>
          Instagram
          <input
            type="url"
            placeholder="https://instagram.com/tu_usuario"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
          />
        </label>
        <label style={FIELD_STYLE}>
          Facebook
          <input
            type="url"
            placeholder="https://facebook.com/tu_pagina"
            value={facebookUrl}
            onChange={(e) => setFacebookUrl(e.target.value)}
          />
        </label>
        <label style={FIELD_STYLE}>
          TikTok
          <input
            type="url"
            placeholder="https://tiktok.com/@tu_usuario"
            value={tiktokUrl}
            onChange={(e) => setTiktokUrl(e.target.value)}
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
