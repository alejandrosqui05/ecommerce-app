import logo from "../../assets/logo.jpg";
import "./BrandHero.css";

const TAGLINE =
  import.meta.env.VITE_STORE_TAGLINE || "Encuentra los mejores productos al mejor precio";

export default function BrandHero({ search, onSearchChange }) {
  return (
    <div className="brand-hero">
      <img src={logo} alt="Inversiones Wildar C.A." className="brand-hero__logo" />
      <p className="brand-hero__tagline">{TAGLINE}</p>
      <div className="brand-hero__search">
        <input
          type="search"
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}
