export type SampleCourse = {
  title: string;
  tag: string;
  category: string;
  durationHours: number;
  enrolledCount: number;
};

// Illustrative listing shown only when the live catalog has nothing published yet
// for a category, so the page never renders empty.
export const sampleCourses: SampleCourse[] = [
  {
    title: "Certified Scrum Master (CSM)",
    tag: "Trending",
    category: "Agile Management",
    durationHours: 16,
    enrolledCount: 3420,
  },
  {
    title: "Project Management Professional (PMP)",
    tag: "Trending",
    category: "Project Management",
    durationHours: 24,
    enrolledCount: 2890,
  },
  {
    title: "Certified Product Management Professional",
    tag: "Recommended",
    category: "Product Management",
    durationHours: 18,
    enrolledCount: 1240,
  },
  {
    title: "Certified Scrum Product Owner (CSPO)",
    tag: "Recommended",
    category: "Product Owner",
    durationHours: 16,
    enrolledCount: 1980,
  },
  {
    title: "DevOps Foundation Certification",
    tag: "Trending",
    category: "DevOps",
    durationHours: 12,
    enrolledCount: 2150,
  },
  {
    title: "ISTQB Certified Tester Foundation Level",
    tag: "Recommended",
    category: "Software Testing",
    durationHours: 10,
    enrolledCount: 1670,
  },
  {
    title: "ITIL 4 Foundation Certification",
    tag: "Recommended",
    category: "Service Management",
    durationHours: 14,
    enrolledCount: 1430,
  },
];
