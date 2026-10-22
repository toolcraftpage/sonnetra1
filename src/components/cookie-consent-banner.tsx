"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  adsConsentChangedEvent,
  readAdsConsent,
  saveAdsConsent,
  type AdsConsent,
} from "@/lib/ads-consent";

export function CookieConsentBanner() {
  const [consent, setConsent] = useState<AdsConsent>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const syncConsent = () => setConsent(readAdsConsent());
    syncConsent();
    window.addEventListener(adsConsentChangedEvent, syncConsent);
    return () => window.removeEventListener(adsConsentChangedEvent, syncConsent);
  }, []);

  function chooseConsent(value: Exclude<AdsConsent, null>) {
    saveAdsConsent(value);
    setConsent(value);
    setSettingsOpen(false);
  }

  if (consent !== null && !settingsOpen) {
    return (
      <button
        className="cookie-settings-button"
        type="button"
        onClick={() => setSettingsOpen(true)}
        aria-label="Open cookie settings"
      >
        Cookie settings
      </button>
    );
  }

  return (
    <aside className="cookie-consent-banner" aria-label="Cookie and advertising choices" aria-live="polite">
      <div className="cookie-consent-copy">
        <p className="eyebrow">Your privacy choices</p>
        <h2>Choose whether to allow advertising cookies</h2>
        <p>
          Essential site features remain available either way. Optional Google AdSense
          advertising loads only after you allow it. Read our <Link href="/privacy">Privacy Notice</Link>.
        </p>
        <p>
          Changing your choice affects future ad activation on Sonnetra; it cannot erase
          cookies or data already handled by an advertising provider.
        </p>
        <p className="cookie-cmp-note">
          This lightweight preference banner is not a Google-certified CMP. Before serving
          ads to visitors in the EEA or UK, production must use a Google-certified CMP,
          such as CookieYes or Didomi, configured for the applicable consent requirements.
        </p>
      </div>
      <div className="cookie-consent-actions">
        <button type="button" className="cookie-reject-button" onClick={() => chooseConsent("denied")}>
          Reject optional
        </button>
        <button type="button" className="cookie-accept-button" onClick={() => chooseConsent("granted")}>
          Allow advertising
        </button>
      </div>
    </aside>
  );
}
