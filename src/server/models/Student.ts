import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, trim: true },
    purchasedCourses: { type: [String], default: [] }, // Array of course slugs
  },
  { timestamps: true },
);

export const Student = mongoose.models.Student ?? mongoose.model("Student", studentSchema);
