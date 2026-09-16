import { getVisitorId } from "./visitor";
import { getAttribution } from "./attribution";

export type CartTrackEvent = "add_to_cart" | "begin_checkout" | "customer_details_submitted";

type CartTrackPayload = {
  courseSlug: string;
  courseTitle?: string;
  amount?: number;
  name?: string;
  email?: string;
  phone?: string;
  state?: string;
  city?: string;
};

// Fire-and-forget: tracking must never block or break the checkout flow, so
// failures (network, ad blockers) are swallowed silently.
export function trackCartEvent(event: CartTrackEvent, payload: CartTrackPayload): void {
  if (typeof window === "undefined") return;
  try {
    fetch("/api/cart-track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitorId: getVisitorId(),
        event,
        attribution: getAttribution() || undefined,
        ...payload,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // ignore
  }
}
