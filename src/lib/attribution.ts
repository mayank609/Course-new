const STORAGE_KEY = "sp_attribution";

export type Attribution = {
  source: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
  landingPage?: string;
  capturedAt: string;
};

const SEARCH_ENGINES = ["google.", "bing.", "yahoo.", "duckduckgo."];
const SOCIAL_PLATFORMS = ["facebook.com", "instagram.com", "linkedin.com", "twitter.com", "x.com", "youtube.com", "t.co"];

function classifySource(
  params: URLSearchParams,
  referrer: string
): { source: string; utmSource?: string; utmMedium?: string; utmCampaign?: string } {
  const utmSource = params.get("utm_source") || undefined;
  const utmMedium = params.get("utm_medium") || undefined;
  const utmCampaign = params.get("utm_campaign") || undefined;

  if (params.get("fbclid")) return { source: "Facebook / Instagram Ads", utmSource, utmMedium, utmCampaign };
  if (params.get("gclid")) return { source: "Google Ads", utmSource, utmMedium, utmCampaign };
  if (utmSource) {
    const label = utmSource.charAt(0).toUpperCase() + utmSource.slice(1);
    return { source: utmMedium ? `${label} (${utmMedium})` : label, utmSource, utmMedium, utmCampaign };
  }

  if (referrer) {
    try {
      const host = new URL(referrer).hostname.replace(/^www\./, "");
      if (SEARCH_ENGINES.some((s) => host.includes(s))) return { source: "Organic Search" };
      if (SOCIAL_PLATFORMS.some((s) => host === s || host.endsWith(`.${s}`))) return { source: `Social (${host})` };
      return { source: `Referral (${host})` };
    } catch {
      // malformed referrer — fall through to Direct
    }
  }

  return { source: "Direct / Website" };
}

/**
 * Last-marketing-touch attribution: overwrites the stored record whenever this visit
 * carries a genuine new signal (utm/click-id params, or an external referrer), but
 * plain in-app navigation never clobbers a previously captured touch.
 */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;

  try {
    const params = new URLSearchParams(window.location.search);
    const hasCampaignSignal = params.has("utm_source") || params.has("fbclid") || params.has("gclid");
    const referrer = document.referrer || "";
    let referrerIsExternal = false;
    if (referrer) {
      try {
        referrerIsExternal = new URL(referrer).hostname !== window.location.hostname;
      } catch {
        referrerIsExternal = false;
      }
    }

    const alreadyCaptured = Boolean(localStorage.getItem(STORAGE_KEY));
    if (alreadyCaptured && !hasCampaignSignal && !referrerIsExternal) return;

    const { source, utmSource, utmMedium, utmCampaign } = classifySource(params, referrer);
    const attribution: Attribution = {
      source,
      utmSource,
      utmMedium,
      utmCampaign,
      referrer: referrer || undefined,
      landingPage: window.location.pathname,
      capturedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // localStorage unavailable (private browsing, etc.) — attribution silently skipped
  }
}

export function getAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    return null;
  }
}
