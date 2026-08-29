import "./SearchBar.css";

export default function SearchBar({ value, onChange }) {
  return (
    <div className="search-bar">
      <input
        type="search"
        placeholder="Buscar productos..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
