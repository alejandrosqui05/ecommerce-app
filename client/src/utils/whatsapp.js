const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER || "").replace(/\D/g, "");

export function isWhatsAppConfigured() {
  return WHATSAPP_NUMBER.length > 0;
}

export function buildWhatsAppLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function buildOrderMessage(items, totalPrice, formatPrice) {
  const lines = items.map(
    (item) => `• ${item.quantity}x ${item.name} — ${formatPrice(item.price * item.quantity)}`
  );

  return [
    "¡Hola! Quiero hacer el siguiente pedido:",
    "",
    ...lines,
    "",
    `Total: ${formatPrice(totalPrice)}`,
  ].join("\n");
}
