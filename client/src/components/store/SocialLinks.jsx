import { useEffect, useState } from "react";
import { getStoreSettings } from "../../api/db";
import "./SocialLinks.css";

export default function SocialLinks() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    getStoreSettings()
      .then(setSettings)
      .catch(() => setSettings(null));
  }, []);

  const links = [
    settings?.instagramUrl && { url: settings.instagramUrl, label: "Instagram", icon: <InstagramIcon /> },
    settings?.facebookUrl && { url: settings.facebookUrl, label: "Facebook", icon: <FacebookIcon /> },
    settings?.tiktokUrl && { url: settings.tiktokUrl, label: "TikTok", icon: <TikTokIcon /> },
  ].filter(Boolean);

  if (links.length === 0) return null;

  return (
    <div className="social-links">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="social-links__item"
          aria-label={link.label}
        >
          {link.icon}
        </a>
      ))}
    </div>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-7.6h2.6l.4-3h-3v-1.9c0-.87.24-1.46 1.5-1.46H16.6V4.34C16.3 4.3 15.3 4.2 14.15 4.2c-2.4 0-4.05 1.47-4.05 4.16V10.4H7.5v3h2.6V21h3.4Z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M16.5 3c.35 1.9 1.6 3.2 3.5 3.4v2.9c-1.24.02-2.4-.36-3.5-1.1v6.2c0 3-2.44 5.6-5.6 5.6S5.3 17.4 5.3 14.4c0-2.95 2.28-5.4 5.2-5.58v3.02c-1.2.2-2.1 1.2-2.1 2.46 0 1.4 1.15 2.5 2.6 2.5s2.6-1.1 2.6-2.5V3h2.9Z" />
    </svg>
  );
}
