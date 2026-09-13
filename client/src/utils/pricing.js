// Modelo de precios: "originalPrice" es el precio normal de siempre.
// "price" (precio de descuento) es opcional y solo se llena cuando hay
// una oferta activa — mientras esté vacío/0, el precio normal es el que
// se cobra y se muestra, sin raya ni pulso.

export function getEffectivePrice(product) {
  const price = Number(product?.price) || 0;
  const originalPrice = Number(product?.originalPrice) || 0;
  return price > 0 ? price : originalPrice;
}

export function getDiscountReferencePrice(product) {
  const price = Number(product?.price) || 0;
  const originalPrice = Number(product?.originalPrice) || 0;
  return price > 0 && originalPrice > price ? originalPrice : null;
}
