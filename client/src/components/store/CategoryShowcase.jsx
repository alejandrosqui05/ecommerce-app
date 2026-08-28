import { useState } from "react";
import { getCategoryGradient } from "../../utils/categoryColors";
import "./CategoryShowcase.css";

const VISIBLE_COUNT = 6;

export default function CategoryShowcase({ categories, onSelect }) {
  const [expanded, setExpanded] = useState(false);

  if (categories.length === 0) return null;

  const visible = expanded ? categories : categories.slice(0, VISIBLE_COUNT);
  const hasMore = categories.length > VISIBLE_COUNT;

  return (
    <section className="category-showcase">
      <div className="category-showcase__header">
        <h2>Comprar en</h2>
        {hasMore && (
          <button className="category-showcase__toggle" onClick={() => setExpanded((v) => !v)}>
            {expanded ? "Ver menos" : "Más categorías ›"}
          </button>
        )}
      </div>

      <div className="category-showcase__grid">
        {visible.map((cat, i) => (
          <button
            key={cat.id}
            className="category-card"
            style={{ background: getCategoryGradient(i) }}
            onClick={() => onSelect(cat.slug)}
          >
            <span className="category-card__frame" aria-hidden="true" />
            <span className="category-card__name">{cat.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
