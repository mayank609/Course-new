export type SampleCourse = {
  title: string;
  tag: string;
  category: string;
  durationHours: number;
  enrolledCount: number;
  slug?: string;
  price?: number;
  originalPrice?: number;
  imageUrl?: string;
};

// Mock courses shown during loading or database sync to match Sarvpratham Analytics
export const sampleCourses: SampleCourse[] = [
  {
    title: "MS Excel Essentials Course Basics",
    tag: "Best Seller",
    category: "Data & Productivity",
    durationHours: 15,
    enrolledCount: 1420,
    slug: "excel-essentials",
    price: 499,
    originalPrice: 1999,
  },
  {
    title: "Advanced Excel Mastery Course with AI & Real-Life Projects",
    tag: "Trending",
    category: "Data & Productivity",
    durationHours: 35,
    enrolledCount: 2890,
    slug: "excel-mastery",
    price: 999,
    originalPrice: 3499,
  },
  {
    title: "MS Word & PowerPoint Essentials with AI Course",
    tag: "Recommended",
    category: "Data & Productivity",
    durationHours: 20,
    enrolledCount: 940,
    slug: "word-ppt-essentials",
    price: 499,
    originalPrice: 1999,
  },
  {
    title: "Advance MS Word & Powerpoint Mastery + AI Course",
    tag: "Hot & New",
    category: "Data & Productivity",
    durationHours: 30,
    enrolledCount: 1240,
    slug: "word-ppt-mastery",
    price: 999,
    originalPrice: 3499,
  },
];
