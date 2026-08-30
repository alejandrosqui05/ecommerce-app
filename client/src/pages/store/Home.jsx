import { useEffect, useMemo, useRef, useState } from "react";
import { listCategories, listPublicProducts } from "../../api/db";
import Header from "../../components/store/Header";
import BrandHero from "../../components/store/BrandHero";
import BannerCarousel from "../../components/store/BannerCarousel";
import SearchBar from "../../components/store/SearchBar";
import ProductGrid from "../../components/store/ProductGrid";
import CartDrawer from "../../components/store/CartDrawer";
import WhatsAppButton from "../../components/store/WhatsAppButton";
import Footer from "../../components/store/Footer";

const PAGE_SIZE = 30;

function sortWithConectoresFirst(data) {
  return [...data].sort((a, b) => {
    const aFirst = a.category?.slug === "conectores" ? 0 : 1;
    const bFirst = b.category?.slug === "conectores" ? 0 : 1;
    return aFirst - bFirst;
  });
}

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeSlug, setActiveSlug] = useState("all");
  const [search, setSearch] = useState("");
  const sentinelRef = useRef(null);

  useEffect(() => {
    listCategories().then(setCategories);
  }, []);

  // Reinicia la paginación cuando cambia el filtro de categoría o la búsqueda
  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      const params = { page: 0, pageSize: PAGE_SIZE };
      if (activeSlug !== "all") params.category = activeSlug;
      if (search.trim()) params.search = search.trim();

      listPublicProducts(params)
        .then((data) => {
          setProducts(activeSlug === "all" ? sortWithConectoresFirst(data) : data);
          setPage(0);
          setHasMore(data.length === PAGE_SIZE);
        })
        .finally(() => setLoading(false));
    }, 250); // debounce para la búsqueda en tiempo real

    return () => clearTimeout(timeout);
  }, [activeSlug, search]);

  // Trae la siguiente página cuando el usuario se acerca al final
  function loadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const params = { page: nextPage, pageSize: PAGE_SIZE };
    if (activeSlug !== "all") params.category = activeSlug;
    if (search.trim()) params.search = search.trim();

    listPublicProducts(params)
      .then((data) => {
        setProducts((prev) => {
          const combined = [...prev, ...data];
          return activeSlug === "all" ? sortWithConectoresFirst(combined) : combined;
        });
        setPage(nextPage);
        setHasMore(data.length === PAGE_SIZE);
      })
      .finally(() => setLoadingMore(false));
  }

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "600px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, hasMore, loadingMore, activeSlug, search, loading]);

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
        {!loading && hasMore && (
          <div ref={sentinelRef} className="store-page__load-more-sentinel">
            {loadingMore && <p className="store-page__load-more-text">Cargando más productos...</p>}
          </div>
        )}
      </div>

      <Footer />
      <CartDrawer />
      <WhatsAppButton />
    </div>
  );
}
