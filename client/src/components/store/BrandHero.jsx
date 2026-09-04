import logo from "../../assets/logo.jpg";
import SocialLinks from "./SocialLinks";
import "./BrandHero.css";

const TAGLINE =
  import.meta.env.VITE_STORE_TAGLINE || "Encuentra los mejores productos al mejor precio";

export default function BrandHero() {
  return (
    <div className="brand-hero">
      <img src={logo} alt="Inversiones Wildar C.A." className="brand-hero__logo" />
      <p className="brand-hero__tagline">{TAGLINE}</p>
      <SocialLinks />
    </div>
  );
}
