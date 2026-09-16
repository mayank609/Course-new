import mongoose from "mongoose";

// One row per (visitor, course) — updated in place as a shopper moves through
// the funnel, rather than a raw event log. This is what the admin "Add to
// Cart" / "Abandoned Checkout" screens read directly: the current status is
// always right there instead of needing to be derived from a stream of rows.
// `events` still keeps a lightweight step-by-step trail for drill-down.
export const CART_ACTIVITY_STATUSES = [
  "Added to Cart",
  "Checkout Started",
  "Payment Pending",
  "Payment Failed",
  "Purchase Completed",
] as const;

const cartActivitySchema = new mongoose.Schema(
  {
    visitorId: { type: String, required: true, trim: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    courseSlug: { type: String, required: true, trim: true },
    courseTitle: { type: String, default: "" },
    amount: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    state: { type: String, default: "" },
    city: { type: String, default: "" },
    source: { type: String, default: "Direct / Website" },
    utmSource: { type: String, default: "" },
    utmMedium: { type: String, default: "" },
    utmCampaign: { type: String, default: "" },
    referrer: { type: String, default: "" },
    landingPage: { type: String, default: "" },
    status: { type: String, enum: CART_ACTIVITY_STATUSES, default: "Added to Cart" },
    orderId: { type: String, default: "" },
    followUpStatus: { type: String, default: "" },
    followUpNote: { type: String, default: "" },
    events: {
      type: [{ event: { type: String, required: true }, at: { type: Date, default: Date.now } }],
      default: [],
    },
    lastActivityAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

cartActivitySchema.index({ visitorId: 1, courseSlug: 1 }, { unique: true });
cartActivitySchema.index({ orderId: 1 });
cartActivitySchema.index({ lastActivityAt: -1 });

export const CartActivity = mongoose.models.CartActivity ?? mongoose.model("CartActivity", cartActivitySchema);
