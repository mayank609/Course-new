import type { Course } from "@/lib/api";
import type { SampleCourse } from "@/lib/sampleCourses";

export type DisplayCourse = {
  key: string;
  title: string;
  tag: string;
  category: string;
  durationHours: number;
  enrolledCount: number;
  slug?: string;
  imageUrl?: string;
  syllabusUrl?: string;
  price?: number;
};

export function toDisplayCourses(courses: Course[]): DisplayCourse[] {
  return courses.map((c) => ({
    key: c._id,
    title: c.title,
    tag: c.tag,
    category: c.category,
    durationHours: c.durationHours,
    enrolledCount: c.enrolledCount,
    slug: c.slug,
    imageUrl: c.imageUrl,
    syllabusUrl: c.syllabusUrl,
    price: c.price,
  }));
}

export function sampleToDisplayCourses(courses: SampleCourse[]): DisplayCourse[] {
  return courses.map((c) => ({
    key: c.title,
    title: c.title,
    tag: c.tag,
    category: c.category,
    durationHours: c.durationHours,
    enrolledCount: c.enrolledCount,
    slug: c.slug,
    price: c.price,
  }));
}
