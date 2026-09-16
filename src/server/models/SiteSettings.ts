import mongoose from "mongoose";

// A single settings document the admin edits (e.g. the homepage YouTube demo
// video) without needing a developer to change code. Always read/written via
// the fixed id "singleton" so there is only ever one row.
const siteSettingsSchema = new mongoose.Schema(
  {
    _id: { type: String, default: "singleton" },
    youtubeVideoUrl: { type: String, default: "" },
    youtubeChannelUrl: { type: String, default: "" },
  },
  { timestamps: true },
);

export const SiteSettings = mongoose.models.SiteSettings ?? mongoose.model("SiteSettings", siteSettingsSchema);
