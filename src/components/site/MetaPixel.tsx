import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

const META_PIXEL_IDS = ["947778844694322"];

// Only the live site may write into the production dataset. Without this guard
// localhost and Vercel preview deployments fire into the same pixel — Events
// Manager was showing 385 events from *.vercel.app and 37 from localhost mixed
// in with real traffic.
const PRODUCTION_HOST_RE = /(^|\.)sarvprathamanalytics\.com$/;

function isTrackingHost(hostname: string): boolean {
  return PRODUCTION_HOST_RE.test(hostname);
}

function newEventId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function metaPixelInitScript(): string {
  const initCalls = META_PIXEL_IDS.map((id) => `fbq('init', '${id}');`).join("\n");
  // The host check is inlined into the snippet itself because this script is
  // server-rendered into <head> — at render time we do not yet know the hostname.
  //
  // Note: PageView is deliberately NOT fired here. It is fired from
  // useMetaPixelPageViews() instead, so it carries an eventID and can be
  // deduplicated against the matching Conversions API event.
  return `if (${PRODUCTION_HOST_RE.toString()}.test(location.hostname)) {
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
${initCalls}
}`;
}

// Relays the same event to the Conversions API with the SAME event_id, so Meta
// can pair the browser and server copies instead of counting them separately.
// Purchase is excluded: the server already sends it from the payment-verify
// handler keyed on the Cashfree order id, which is more reliable than trusting
// the browser for revenue.
function mirrorToConversionsApi(eventName: string, eventId: string, customData?: Record<string, unknown>) {
  if (eventName === "Purchase") return;
  try {
    void fetch("/api/meta/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName,
        eventId,
        eventSourceUrl: window.location.href,
        customData: customData ?? {},
      }),
      keepalive: true,
      credentials: "same-origin",
    }).catch(() => {
      // Tracking must never break the page.
    });
  } catch {
    // Ignore — tracking is best-effort.
  }
}

// Meta's standard install also ships a <noscript> tracking pixel. It is omitted
// here on purpose: static HTML cannot be host-gated, so it would keep firing
// PageView from localhost and Vercel previews — the exact staging leak this file
// is meant to close. A no-JS PageView also carries no eventID, no _fbp/_fbc and
// no Conversions API twin, so it contributes nothing to conversion reporting.

export function MetaPixel() {
  return <script dangerouslySetInnerHTML={{ __html: metaPixelInitScript() }} />;
}

// The base script no longer fires PageView, so this hook owns every PageView —
// the first one plus each client-side navigation in this SPA.
export function useMetaPixelPageViews() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    trackMetaEvent("PageView");
  }, [pathname]);
}

export function trackMetaEvent(event: string, data?: Record<string, unknown>, eventId?: string) {
  if (typeof window === "undefined") return;
  if (!isTrackingHost(window.location.hostname)) return;

  const id = eventId || newEventId();
  const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
  if (fbq) {
    fbq("track", event, data ?? {}, { eventID: id });
  }
  mirrorToConversionsApi(event, id, data);
}
