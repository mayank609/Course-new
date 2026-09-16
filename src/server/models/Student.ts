import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Empty until the student sets a password — true for guests created from a
    // guest checkout (see api.ts findOrCreateGuestStudent) who haven't yet
    // activated their account via the emailed OTP link.
    passwordHash: { type: String, default: "" },
    phone: { type: String, trim: true },
    // Last-10-digits normalized form of `phone`, used to match a guest checkout
    // or a new registration against an existing account regardless of how the
    // phone number was formatted (spaces, +91 prefix, etc). See normalizePhone().
    phoneNormalized: { type: String, trim: true, index: true },
    isActivated: { type: Boolean, default: true },
    purchasedCourses: { type: [String], default: [] }, // Array of course slugs
  },
  { timestamps: true },
);

export const Student = mongoose.models.Student ?? mongoose.model("Student", studentSchema);
