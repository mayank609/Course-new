import crypto from "node:crypto";

const DEFAULT_PIXEL_ID = "947778844694322";

// Standard events we are willing to relay to Meta. Anything not on this list is
// rejected so the public /api/meta/track endpoint cannot be used to inject
// arbitrary events into the production dataset.
export const ALLOWED_META_EVENTS = [
  "PageView",
  "ViewContent",
  "AddToCart",
  "InitiateCheckout",
  "AddPaymentInfo",
  "Search",
  "Lead",
  "CompleteRegistration",
] as const;

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`; // default to India country code, matching whatsapp.ts convention
  return digits;
}

export type MetaUserContext = {
  email?: string;
  phone?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbc?: string;
  fbp?: string;
};

export type MetaEventArgs = MetaUserContext & {
  eventName: string;
  /**
   * Must be identical to the `eventID` passed to fbq() in the browser for the
   * same user action — this is what lets Meta deduplicate the browser/server pair.
   */
  eventId: string;
  eventSourceUrl: string;
  customData?: Record<string, unknown>;
};

export function isMetaConversionsConfigured(): boolean {
  return Boolean(process.env.META_CONVERSIONS_ACCESS_TOKEN);
}

export async function sendMetaEvent(args: MetaEventArgs): Promise<void> {
  const accessToken = process.env.META_CONVERSIONS_ACCESS_TOKEN;
  if (!accessToken) {
    console.warn(`[meta-capi] META_CONVERSIONS_ACCESS_TOKEN not set — skipping server-side ${args.eventName} event`);
    return;
  }
  const pixelId = process.env.META_PIXEL_ID || DEFAULT_PIXEL_ID;

  const userData: Record<string, unknown> = {};
  if (args.email) userData.em = [sha256(args.email)];
  if (args.phone) userData.ph = [sha256(normalizePhone(args.phone))];
  if (args.clientIpAddress) userData.client_ip_address = args.clientIpAddress;
  if (args.clientUserAgent) userData.client_user_agent = args.clientUserAgent;
  if (args.fbc) userData.fbc = args.fbc;
  if (args.fbp) userData.fbp = args.fbp;

  const payload = {
    data: [
      {
        event_name: args.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: args.eventId,
        event_source_url: args.eventSourceUrl,
        action_source: "website",
        user_data: userData,
        custom_data: args.customData ?? {},
      },
    ],
  };

  const res = await fetch(
    `https://graph.facebook.com/v20.0/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Meta Conversions API request failed (${res.status}): ${body}`);
  }
}

type PurchaseEventArgs = MetaUserContext & {
  value: number;
  currency: string;
  eventId: string;
  eventSourceUrl: string;
  contentIds?: string[];
  contentName?: string;
  numItems?: number;
};

export async function sendMetaPurchaseEvent(args: PurchaseEventArgs): Promise<void> {
  // Meta cannot compute ROAS from a zero/blank value, and a zero-value Purchase
  // pollutes the dataset. Free enrolments and 100%-off orders are skipped instead.
  if (!Number.isFinite(args.value) || args.value <= 0) {
    console.warn(
      `[meta-capi] skipping Purchase for ${args.eventId} — value is ${args.value}, Meta requires a number greater than zero`
    );
    return;
  }

  await sendMetaEvent({
    ...args,
    eventName: "Purchase",
    customData: {
      currency: args.currency,
      // Must be a number. Sending a string here is what made Meta report ~31% of
      // Purchase events as having a missing value.
      value: Number(args.value.toFixed(2)),
      order_id: args.eventId,
      content_type: "product",
      ...(args.contentIds?.length ? { content_ids: args.contentIds } : {}),
      ...(args.contentName ? { content_name: args.contentName } : {}),
      ...(args.numItems ? { num_items: args.numItems } : {}),
    },
  });
}
