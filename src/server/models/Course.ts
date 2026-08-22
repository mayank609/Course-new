import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    tag: { type: String, default: "Trending" },
    category: { type: String, required: true, trim: true },
    level: { type: String, default: "All Levels" },
    durationHours: { type: Number, default: 8 },
    price: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
    enrolledCount: { type: Number, default: 0 },
    shortDescription: { type: String, default: "" },
    description: { type: String, default: "" },
    highlights: { type: [String], default: [] },
    imageUrl: { type: String, default: "" },
    syllabusUrl: { type: String, default: "" },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Course = mongoose.models.Course ?? mongoose.model("Course", courseSchema);
