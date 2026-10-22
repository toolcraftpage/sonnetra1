export type AdsConsent = "granted" | "denied" | null;

const consentCookieName = "sonnetra_ads_consent";
export const adsConsentChangedEvent = "sonnetra:ads-consent-changed";

export function readAdsConsent(): AdsConsent {
  const entry = document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${consentCookieName}=`));
  const value = entry?.slice(consentCookieName.length + 1);
  return value === "granted" || value === "denied" ? value : null;
}

export function saveAdsConsent(consent: Exclude<AdsConsent, null>): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${consentCookieName}=${consent}; Path=/; Max-Age=15552000; SameSite=Lax${secure}`;
  window.dispatchEvent(new Event(adsConsentChangedEvent));
}
