import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listPublicBanners } from "../../api/db";
import "./BannerCarousel.css";

const AUTOPLAY_MS = 4500;

export default function BannerCarousel() {
  const [banners, setBanners] = useState([]);
  const [index, setIndex] = useState(0);
  const trackRef = useRef(null);
  const touchStartX = useRef(null);
  const autoplayRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    listPublicBanners().then(setBanners);
  }, []);

  const goTo = useCallback(
    (i) => {
      if (banners.length === 0) return;
      const next = (i + banners.length) % banners.length;
      setIndex(next);
    },
    [banners.length]
  );

  const resetAutoplay = useCallback(() => {
    clearInterval(autoplayRef.current);
    if (banners.length <= 1) return;
    autoplayRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, AUTOPLAY_MS);
  }, [banners.length]);

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

  function handleBannerClick(banner) {
    if (!banner.linkUrl) return;
    if (/^https?:\/\//i.test(banner.linkUrl)) {
      window.open(banner.linkUrl, "_blank", "noopener,noreferrer");
    } else {
      navigate(banner.linkUrl);
    }
  }

  if (banners.length === 0) return null;

  return (
    <div className="banner-carousel">
      <div
        className="banner-carousel__track"
        ref={trackRef}
        style={{ transform: `translateX(-${index * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            className={`banner-carousel__slide ${banner.linkUrl ? "is-clickable" : ""}`}
            onClick={() => handleBannerClick(banner)}
          >
            <img src={banner.imageUrl} alt={banner.title || "Promoción"} loading="lazy" />
            {banner.title && (
              <div className="banner-carousel__text">
                <h2>{banner.title}</h2>
                {banner.subtitle && <p>{banner.subtitle}</p>}
              </div>
            )}
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <div className="banner-carousel__dots">
          {banners.map((banner, i) => (
            <button
              key={banner.id}
              className={`banner-carousel__dot ${i === index ? "is-active" : ""}`}
              onClick={() => {
                goTo(i);
                resetAutoplay();
              }}
              aria-label={`Ir al banner ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
