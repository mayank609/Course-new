import mongoose from "mongoose";

const LEAD_SOURCES = [
  "newsletter",
  "contact",
  "corporate",
  "enterprise",
  "interview-prep",
  "course-enquiry",
] as const;

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: "" },
    company: { type: String, default: "" },
    message: { type: String, default: "" },
    source: { type: String, enum: LEAD_SOURCES, required: true },
    courseTitle: { type: String, default: "" },
    status: { type: String, enum: ["new", "contacted", "closed"], default: "new" },
  },
  { timestamps: true },
);

export const LEAD_SOURCE_VALUES = LEAD_SOURCES;
export const Lead = mongoose.models.Lead ?? mongoose.model("Lead", leadSchema);
