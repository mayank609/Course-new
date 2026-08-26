export type Course = {
  _id: string;
  title: string;
  slug: string;
  tag: string;
  category: string;
  level: string;
  durationHours: number;
  price: number;
  currency: string;
  enrolledCount: number;
  shortDescription: string;
  description: string;
  highlights: string[];
  recommendedCourses: string[];
  recommendedCourseDetails?: Course[];
  imageUrl: string;
  syllabusUrl?: string;
  published: boolean;
};

export type LeadSource =
  | "newsletter"
  | "contact"
  | "corporate"
  | "enterprise"
  | "interview-prep"
  | "course-enquiry";

export type LeadPayload = {
  name?: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  source: LeadSource;
  courseTitle?: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (data as { error?: string }).error ?? "Something went wrong. Please try again.",
    );
  }
  return data as T;
}

export function fetchCourses(category?: string) {
  const query = category ? `?category=${encodeURIComponent(category)}` : "";
  return request<Course[]>(`/api/courses${query}`);
}

export function fetchCourse(slug: string) {
  return request<Course>(`/api/courses/${encodeURIComponent(slug)}`);
}

export function submitLead(payload: LeadPayload) {
  return request<{ id: string }>("/api/leads", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type Category = {
  _id: string;
  name: string;
};

export function fetchCategories() {
  return request<Category[]>("/api/categories");
}
