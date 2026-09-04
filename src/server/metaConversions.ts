import crypto from "node:crypto";

const DEFAULT_PIXEL_ID = "947778844694322";

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`; // default to India country code, matching whatsapp.ts convention
  return digits;
}

type PurchaseEventArgs = {
  email?: string;
  phone?: string;
  value: number;
  currency: string;
  eventId: string;
  eventSourceUrl: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbc?: string;
  fbp?: string;
};

export function isMetaConversionsConfigured(): boolean {
  return Boolean(process.env.META_CONVERSIONS_ACCESS_TOKEN);
}

export async function sendMetaPurchaseEvent(args: PurchaseEventArgs): Promise<void> {
  const accessToken = process.env.META_CONVERSIONS_ACCESS_TOKEN;
  if (!accessToken) {
    console.warn("[meta-capi] META_CONVERSIONS_ACCESS_TOKEN not set — skipping server-side Purchase event");
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
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: args.eventId,
        event_source_url: args.eventSourceUrl,
        action_source: "website",
        user_data: userData,
        custom_data: {
          currency: args.currency,
          value: args.value.toFixed(2),
        },
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
