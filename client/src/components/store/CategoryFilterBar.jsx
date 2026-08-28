import "./CategoryFilterBar.css";

export default function CategoryFilterBar({ categories, activeSlug, onSelect }) {
  return (
    <div className="category-bar">
      <div className="category-bar__scroll">
        <button
          className={`category-bar__chip ${activeSlug === "all" ? "is-active" : ""}`}
          onClick={() => onSelect("all")}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-bar__chip ${activeSlug === cat.slug ? "is-active" : ""}`}
            onClick={() => onSelect(cat.slug)}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
