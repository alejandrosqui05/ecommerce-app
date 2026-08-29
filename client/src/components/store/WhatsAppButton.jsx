import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../utils/format";
import { isWhatsAppConfigured } from "../../utils/whatsapp";
import "./WhatsAppButton.css";

const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER || "").replace(/\D/g, "");
const GREETING =
  import.meta.env.VITE_WHATSAPP_GREETING || "Hola, no encontré lo que buscaba.";

export default function WhatsAppButton() {
  const { items, totalPrice } = useCart();
  const tieneProductos = items.length > 0;

  if (!isWhatsAppConfigured()) return null;

  function obtenerUrlWhatsApp() {
    if (!tieneProductos) {
      return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(GREETING)}`;
    }

    let textoPedido = "¡Hola! Quisiera realizar el siguiente pedido:\n\n";
    items.forEach((item) => {
      const subtotal = item.price * item.quantity;
      textoPedido += `• ${item.quantity}x ${item.name} (${formatPrice(subtotal)})\n`;
    });
    textoPedido += `\n*Total estimado:* ${formatPrice(totalPrice)}`;

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(textoPedido)}`;
  }

  return (
    <a
      href={obtenerUrlWhatsApp()}
      target="_blank"
      rel="noopener noreferrer"
      className={`whatsapp-fab ${tieneProductos ? "whatsapp-fab--pedido" : "whatsapp-fab--consulta"}`}
    >
      <span className="whatsapp-fab__icon">
        <WhatsAppIcon />
      </span>
      <span className="whatsapp-fab__label">
        {tieneProductos
          ? `Enviar pedido (${items.reduce((acc, item) => acc + item.quantity, 0)})`
          : "Cuéntanos qué necesitas? Te Solucionamos"}
      </span>
    </a>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 32 32" width="26" height="26" fill="currentColor" aria-hidden="true">
      <path d="M16.02 3C9.4 3 4 8.38 4 15c0 2.31.66 4.46 1.8 6.3L4 29l7.9-1.75A11.9 11.9 0 0 0 16.02 27C22.65 27 28 21.62 28 15S22.65 3 16.02 3Zm6.9 16.98c-.3.83-1.5 1.55-2.44 1.75-.65.13-1.5.24-4.35-.93-3.65-1.5-6-5.2-6.18-5.44-.18-.24-1.47-1.96-1.47-3.74 0-1.78.93-2.65 1.27-3.02.33-.36.72-.45.97-.45.24 0 .48 0 .69.01.22.01.52-.08.81.63.3.72 1.02 2.5 1.11 2.68.09.18.15.4.03.64-.12.24-.18.4-.36.61-.18.21-.38.47-.54.63-.18.18-.37.37-.16.73.21.36.94 1.55 2.02 2.51 1.39 1.24 2.56 1.62 2.92 1.8.36.18.57.15.78-.09.21-.24.9-1.05 1.14-1.41.24-.36.48-.3.81-.18.33.12 2.1.99 2.46 1.17.36.18.6.27.69.42.09.15.09.85-.21 1.68Z" />
    </svg>
  );
}
