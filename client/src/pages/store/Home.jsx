import { useEffect, useMemo, useState } from "react";
import { listCategories, listPublicProducts } from "../../api/db";
import Header from "../../components/store/Header";
import BrandHero from "../../components/store/BrandHero";
import BannerCarousel from "../../components/store/BannerCarousel";
import SearchBar from "../../components/store/SearchBar";
import ProductGrid from "../../components/store/ProductGrid";
import CartDrawer from "../../components/store/CartDrawer";
import WhatsAppButton from "../../components/store/WhatsAppButton";
import Footer from "../../components/store/Footer";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSlug, setActiveSlug] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    listCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (activeSlug !== "all") params.category = activeSlug;
    if (search.trim()) params.search = search.trim();

    const timeout = setTimeout(() => {
      listPublicProducts(params)
        .then((data) => {
          if (activeSlug === "all") {
            data = [...data].sort((a, b) => {
              const aFirst = a.category?.slug === "conectores" ? 0 : 1;
              const bFirst = b.category?.slug === "conectores" ? 0 : 1;
              return aFirst - bFirst;
            });
          }
          setProducts(data);
        })
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
      <Header />
      <BrandHero />
      <BannerCarousel categories={categories} onSelect={selectCategory} />
      <SearchBar value={search} onChange={setSearch} />

      <div id="catalogo">
        <div className="store-page__section-title">
          {activeSlug !== "all" && (
            <button className="store-page__reset-btn" onClick={() => setActiveSlug("all")}>
              Ver todos los productos
            </button>
          )}
          <h2>{title}</h2>
        </div>
        <ProductGrid products={products} loading={loading} />
      </div>

      <Footer />
      <CartDrawer />
      <WhatsAppButton />
    </div>
  );
}
