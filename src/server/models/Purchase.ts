import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true },
    courseSlug: { type: String, required: true, lowercase: true, trim: true },
    courseTitle: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: { type: String, default: "completed" }, // "completed", "pending", "failed"
    paymentId: { type: String, required: true },
  },
  { timestamps: true },
);

export const Purchase = mongoose.models.Purchase ?? mongoose.model("Purchase", purchaseSchema);
