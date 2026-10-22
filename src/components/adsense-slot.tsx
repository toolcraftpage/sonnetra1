"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

import { adsConsentChangedEvent, readAdsConsent } from "@/lib/ads-consent";

function readAdsenseConfig() {
  const enabled = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true";
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim();
  const slotId = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID?.trim();

  if (!enabled || !clientId || !slotId) {
    return null;
  }

  const validClient = /^ca-pub-[0-9]+$/i.test(clientId);
  const validSlot = /^[0-9]+$/u.test(slotId);

  if (!validClient || !validSlot) {
    return null;
  }

  return { clientId, slotId };
}

export function AdSenseSlot() {
  const [adsConsent, setAdsConsent] = useState(false);
  const config = readAdsenseConfig();

  useEffect(() => {
    const syncConsent = () => setAdsConsent(readAdsConsent() === "granted");
    syncConsent();
    window.addEventListener(adsConsentChangedEvent, syncConsent);
    return () => window.removeEventListener(adsConsentChangedEvent, syncConsent);
  }, []);

  if (!config) {
    return null;
  }
  if (!adsConsent) return null;

  return (
    <>
      <Script
        id="sonnetra-adsense-script"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(config.clientId)}`}
        strategy="afterInteractive"
        crossOrigin="anonymous"
        onReady={() => {
          if (readAdsConsent() !== "granted") return;
          const adsbygoogle = (window as typeof window & { adsbygoogle?: unknown[] }).adsbygoogle ?? [];
          adsbygoogle.push({});
          (window as typeof window & { adsbygoogle?: unknown[] }).adsbygoogle = adsbygoogle;
        }}
      />
      <div className="adsense-panel" aria-label="Advertisement">
        <p className="adsense-label">Advertisement</p>
        <ins
          className="adsbygoogle"
          data-ad-client={config.clientId}
          data-ad-slot={config.slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </>
  );
}
