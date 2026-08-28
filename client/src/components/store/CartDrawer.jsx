import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../utils/format";
import { buildOrderMessage, buildWhatsAppLink, isWhatsAppConfigured } from "../../utils/whatsapp";
import "./CartDrawer.css";

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice, clearCart } =
    useCart();

  if (!isOpen) return null;

  function handleCheckout() {
    const message = buildOrderMessage(items, totalPrice, formatPrice);
    window.open(buildWhatsAppLink(message), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="cart-drawer__overlay" onClick={() => setIsOpen(false)}>
      <aside className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <header className="cart-drawer__header">
          <h2>Tu carrito</h2>
          <button onClick={() => setIsOpen(false)} aria-label="Cerrar carrito">
            ✕
          </button>
        </header>

        {items.length === 0 ? (
          <p className="cart-drawer__empty">Tu carrito está vacío.</p>
        ) : (
          <>
            <ul className="cart-drawer__list">
              {items.map((item) => (
                <li key={item.id} className="cart-drawer__item">
                  <img
                    src={item.imageUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23e5e7eb'/%3E%3C/svg%3E"}
                    alt={item.name}
                  />
                  <div className="cart-drawer__item-info">
                    <p className="cart-drawer__item-name">{item.name}</p>
                    <p className="cart-drawer__item-price">{formatPrice(item.price)}</p>
                    <div className="cart-drawer__qty">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    className="cart-drawer__remove"
                    onClick={() => removeItem(item.id)}
                    aria-label="Eliminar producto"
                  >
                    🗑
                  </button>
                </li>
              ))}
            </ul>

            <footer className="cart-drawer__footer">
              <div className="cart-drawer__total">
                <span>Total</span>
                <strong>{formatPrice(totalPrice)}</strong>
              </div>
              <button
                className="cart-drawer__checkout-btn"
                onClick={handleCheckout}
                disabled={!isWhatsAppConfigured()}
                title={
                  isWhatsAppConfigured()
                    ? undefined
                    : "Configura VITE_WHATSAPP_NUMBER para habilitar el pedido por WhatsApp"
                }
              >
                Finalizar compra por WhatsApp
              </button>
              <button className="cart-drawer__clear-btn" onClick={clearCart}>
                Vaciar carrito
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
