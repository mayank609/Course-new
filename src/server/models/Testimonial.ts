import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    company: { type: String, default: "" },
    rating: { type: Number, default: 5 },
    text: { type: String, required: true },
    avatarUrl: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Testimonial = mongoose.models.Testimonial ?? mongoose.model("Testimonial", testimonialSchema);
