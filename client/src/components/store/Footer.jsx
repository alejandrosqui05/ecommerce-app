import { useEffect, useState } from "react";
import { getStoreSettings } from "../../api/db";
import "./Footer.css";

export default function Footer() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    getStoreSettings()
      .then(setSettings)
      .catch(() => setSettings(null));
  }, []);

  const hasAnyInfo = settings && (settings.contactEmail || settings.contactPhone || settings.address);
  if (!hasAnyInfo) return null;

  return (
    <footer className="store-footer">
      <div className="store-footer__inner">
        {settings.contactEmail && (
          <a className="store-footer__item" href={`mailto:${settings.contactEmail}`}>
            <MailIcon />
            <span>{settings.contactEmail}</span>
          </a>
        )}
        {settings.contactPhone && (
          <a className="store-footer__item" href={`tel:${settings.contactPhone}`}>
            <PhoneIcon />
            <span>{settings.contactPhone}</span>
          </a>
        )}
        {settings.address && (
          <span className="store-footer__item">
            <PinIcon />
            <span>{settings.address}</span>
          </span>
        )}
      </div>
    </footer>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
