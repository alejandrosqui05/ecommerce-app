import { useEffect, useRef, useState } from "react";
import { useCart } from "../../context/CartContext";
import "./Header.css";

const HIDE_THRESHOLD = 12; // px de scroll antes de reaccionar, evita parpadeo

export default function Header({ categories, activeSlug, onSelectCategory }) {
  const { totalItems, setIsOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    function handleScroll() {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      if (currentY < 80) {
        setHidden(false);
      } else if (delta > HIDE_THRESHOLD) {
        setHidden(true);
      } else if (delta < -HIDE_THRESHOLD) {
        setHidden(false);
      }

      lastScrollY.current = currentY;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleSelect(slug) {
    onSelectCategory(slug);
    setMenuOpen(false);
  }

  return (
    <header className={`store-header ${hidden ? "is-hidden" : ""}`}>
      <div className="store-header__row">
        <button
          className="store-header__menu-btn"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menú"
        >
          <span className="store-header__menu-icon">☰</span>
          Más
        </button>

        <button
          className="store-header__cart-btn"
          onClick={() => setIsOpen(true)}
          aria-label="Abrir carrito"
        >
          🛒 Carrito
          {totalItems > 0 && <span className="store-header__cart-badge">{totalItems}</span>}
        </button>
      </div>

      {menuOpen && (
        <div className="store-menu__overlay" onClick={() => setMenuOpen(false)}>
          <nav className="store-menu" onClick={(e) => e.stopPropagation()}>
            <div className="store-menu__header">
              <span>Categorías</span>
              <button onClick={() => setMenuOpen(false)} aria-label="Cerrar menú">
                ✕
              </button>
            </div>
            <ul className="store-menu__list">
              <li>
                <button
                  className={activeSlug === "all" ? "is-active" : ""}
                  onClick={() => handleSelect("all")}
                >
                  Todos los productos
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    className={activeSlug === cat.slug ? "is-active" : ""}
                    onClick={() => handleSelect(cat.slug)}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
