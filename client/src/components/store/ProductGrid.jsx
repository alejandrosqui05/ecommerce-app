import ProductCard from "./ProductCard";
import "./ProductGrid.css";

export default function ProductGrid({ products, loading }) {
  if (loading) {
    return (
      <div className="product-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="product-card-skeleton" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return <p className="product-grid__empty">No se encontraron productos.</p>;
  }

  return (
    <div className="product-grid">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  );
}
