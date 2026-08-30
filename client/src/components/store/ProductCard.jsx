import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../utils/format";
import "./ProductCard.css";

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23e5e7eb'/%3E%3C/svg%3E";

export default function ProductCard({ product, index = 0 }) {
  const { addItem } = useCart();
  const pulseDelay = `${(index % 10) * 90}ms`;
  const hasDiscount = Number(product.originalPrice) > Number(product.price);

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
        <div className="product-card__price-row">
          {hasDiscount && (
            <span className="product-card__price-original">{formatPrice(product.originalPrice)}</span>
          )}
          <p
            className={`product-card__price ${hasDiscount ? "is-discounted" : ""}`}
            style={hasDiscount ? { animationDelay: pulseDelay } : undefined}
          >
            {formatPrice(product.price)}
          </p>
        </div>
        <button className="product-card__add-btn" onClick={() => addItem(product)}>
          Añadir al carrito
        </button>
      </div>
    </div>
  );
}
