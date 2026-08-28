import { useEffect, useMemo, useState } from "react";
import api from "../../api/client";
import Header from "../../components/store/Header";
import BrandHero from "../../components/store/BrandHero";
import BannerCarousel from "../../components/store/BannerCarousel";
import CategoryShowcase from "../../components/store/CategoryShowcase";
import CategoryFilterBar from "../../components/store/CategoryFilterBar";
import ProductGrid from "../../components/store/ProductGrid";
import CartDrawer from "../../components/store/CartDrawer";
import WhatsAppButton from "../../components/store/WhatsAppButton";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSlug, setActiveSlug] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (activeSlug !== "all") params.category = activeSlug;
    if (search.trim()) params.search = search.trim();

    const timeout = setTimeout(() => {
      api
        .get("/products", { params })
        .then((res) => setProducts(res.data))
        .finally(() => setLoading(false));
    }, 250); // debounce para la búsqueda en tiempo real

    return () => clearTimeout(timeout);
  }, [activeSlug, search]);

  const title = useMemo(() => {
    if (activeSlug === "all") return "Todos los productos";
    return categories.find((c) => c.slug === activeSlug)?.name || "Productos";
  }, [activeSlug, categories]);

  function selectCategory(slug) {
    setActiveSlug(slug);
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="store-page">
      <Header categories={categories} activeSlug={activeSlug} onSelectCategory={setActiveSlug} />
      <BrandHero search={search} onSearchChange={setSearch} />
      <BannerCarousel />
      <CategoryShowcase categories={categories} onSelect={selectCategory} />

      <div id="catalogo">
        <CategoryFilterBar
          categories={categories}
          activeSlug={activeSlug}
          onSelect={setActiveSlug}
        />
        <div className="store-page__section-title">
          <h2>{title}</h2>
        </div>
        <ProductGrid products={products} loading={loading} />
      </div>

      <CartDrawer />
      <WhatsAppButton />
    </div>
  );
}
