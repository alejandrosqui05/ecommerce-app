import { useCallback, useEffect, useRef, useState } from "react";
import { getCategoryGradient } from "../../utils/categoryColors";
import { getCategoryImage } from "../../utils/categoryImages";
import "./BannerCarousel.css";

const AUTOPLAY_MS = 4500;

export default function BannerCarousel({ categories, onSelect }) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(null);
  const autoplayRef = useRef(null);

  const goTo = useCallback(
    (i) => {
      if (categories.length === 0) return;
      const next = (i + categories.length) % categories.length;
      setIndex(next);
    },
    [categories.length]
  );

  const resetAutoplay = useCallback(() => {
    clearInterval(autoplayRef.current);
    if (categories.length <= 1) return;
    autoplayRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % categories.length);
    }, AUTOPLAY_MS);
  }, [categories.length]);

  useEffect(() => {
    resetAutoplay();
    return () => clearInterval(autoplayRef.current);
  }, [resetAutoplay]);

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      goTo(delta > 0 ? index - 1 : index + 1);
      resetAutoplay();
    }
    touchStartX.current = null;
  }

  if (categories.length === 0) return null;

  const activeCategory = categories[index];
  const activeImage = getCategoryImage(activeCategory.name);

  return (
    <div className="banner-carousel">
      <div
        className="banner-carousel__viewport"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => onSelect(activeCategory.slug)}
        style={activeImage ? undefined : { background: getCategoryGradient(index) }}
      >
        {activeImage && <img src={activeImage} alt={activeCategory.name} className="banner-carousel__image" />}
        <div className="banner-carousel__overlay" />
        <span className="banner-carousel__frame" aria-hidden="true" />
        <span className="banner-carousel__name">{activeCategory.name}</span>
      </div>

      {categories.length > 1 && (
        <div className="banner-carousel__dots">
          {categories.map((cat, i) => (
            <button
              key={cat.id}
              className={`banner-carousel__dot ${i === index ? "is-active" : ""}`}
              onClick={() => {
                goTo(i);
                resetAutoplay();
              }}
              aria-label={`Ir a ${cat.name}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
