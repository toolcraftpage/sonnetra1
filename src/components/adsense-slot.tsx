"use client";

import { useEffect, useMemo } from "react";

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
  const config = useMemo(() => readAdsenseConfig(), []);

  useEffect(() => {
    if (!config) return;

    const scriptId = "sonnetra-adsense-script";
    const existingScript = document.getElementById(scriptId);
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.async = true;
      script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
      script.crossOrigin = "anonymous";
      script.onerror = () => undefined;
      document.head.appendChild(script);
    }

    const adScriptInit = () => {
      if (typeof window === "undefined") return;
      const g = window as typeof window & { adsbygoogle?: unknown[] };
      g.adsbygoogle = g.adsbygoogle ?? [];
      g.adsbygoogle.push({});
    };

    if ((window as typeof window & { adsbygoogle?: unknown[] }).adsbygoogle) {
      adScriptInit();
      return;
    }

    const timer = window.setTimeout(adScriptInit, 250);
    return () => window.clearTimeout(timer);
  }, [config]);

  if (!config) {
    return null;
  }

  return (
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
  );
}
