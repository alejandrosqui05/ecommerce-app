import { useEffect, useRef, useState } from "react";
import { useCart } from "../../context/CartContext";
import "./Header.css";

const HIDE_THRESHOLD = 12; // px de scroll antes de reaccionar, evita parpadeo

export default function Header() {
  const { totalItems, setIsOpen } = useCart();
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

  return (
    <header className={`store-header ${hidden ? "is-hidden" : ""}`}>
      <div className="store-header__row">
        <button
          className="store-header__cart-btn"
          onClick={() => setIsOpen(true)}
          aria-label="Abrir carrito"
        >
          🛒 Carrito
          {totalItems > 0 && <span className="store-header__cart-badge">{totalItems}</span>}
        </button>
      </div>
    </header>
  );
}
