import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../utils/format";
import "./ProductCard.css";

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23e5e7eb'/%3E%3C/svg%3E";

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  return (
    <div className="product-card">
      <div className="product-card__image-wrap">
        {product.code && <span className="product-card__code">Cód. {product.code}</span>}
        <img
          src={product.imageUrl || PLACEHOLDER}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="product-card__image"
        />
      </div>
      <div className="product-card__body">
        <h3 className="product-card__title">{product.name}</h3>
        <p className="product-card__price">{formatPrice(product.price)}</p>
        <button className="product-card__add-btn" onClick={() => addItem(product)}>
          Añadir al carrito
        </button>
      </div>
    </div>
  );
}
