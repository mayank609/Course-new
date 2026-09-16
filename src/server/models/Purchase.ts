import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true },
    courseSlug: { type: String, required: true, lowercase: true, trim: true },
    courseTitle: { type: String, required: true },
    studentPhone: { type: String, default: "" },
    studentState: { type: String, default: "" },
    studentCity: { type: String, default: "" },
    studentPincode: { type: String, default: "" },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: { type: String, default: "completed" }, // "completed", "pending", "failed"
    paymentId: { type: String, required: true },
    isGuestPurchase: { type: Boolean, default: false },
    couponCode: { type: String, default: "" },
    discountAmount: { type: Number, default: 0 },
    source: { type: String, default: "Direct / Website" },
    utmSource: { type: String, default: "" },
    utmMedium: { type: String, default: "" },
    utmCampaign: { type: String, default: "" },
    referrer: { type: String, default: "" },
    landingPage: { type: String, default: "" },
  },
  { timestamps: true },
);

export const Purchase = mongoose.models.Purchase ?? mongoose.model("Purchase", purchaseSchema);
