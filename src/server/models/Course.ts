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
    originalPrice: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
    enrolledCount: { type: Number, default: 0 },
    shortDescription: { type: String, default: "" },
    description: { type: String, default: "" },
    highlights: { type: [String], default: [] },
    recommendedCourses: { type: [String], default: [] }, // Slugs of other courses to upsell at checkout
    quizzes: { type: [{ title: { type: String, required: true }, link: { type: String, default: "" } }], default: [] },
    assignments: { type: [{ title: { type: String, required: true }, link: { type: String, default: "" } }], default: [] },
    classworks: { type: [{ title: { type: String, required: true }, link: { type: String, default: "" } }], default: [] },
    videos: { type: [{ title: { type: String, required: true }, link: { type: String, default: "" } }], default: [] },
    videoModules: {
      type: [
        {
          title: { type: String, required: true },
          lessons: {
            type: [{ title: { type: String, required: true }, link: { type: String, default: "" } }],
            default: [],
          },
        },
      ],
      default: [],
    },
    imageUrl: { type: String, default: "" },
    syllabusUrl: { type: String, default: "" },
    published: { type: Boolean, default: true },
    showInFooter: { type: Boolean, default: true },
    footerOrder: { type: Number, default: 0 },
    // Position on the site's course lists, set by drag-and-drop in the admin
    // panel (lower comes first; ties fall back to newest first).
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Course = mongoose.models.Course ?? mongoose.model("Course", courseSchema);
