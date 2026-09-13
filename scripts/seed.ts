import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../src/server/db";
import { Admin } from "../src/server/models/Admin";
import { Course } from "../src/server/models/Course";
import { Category } from "../src/server/models/Category";
import { Testimonial } from "../src/server/models/Testimonial";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const courses = [
  {
    tag: "Best Seller",
    title: "MS Excel Essentials Course",
    category: "Microsoft Office",
    enrolledCount: 1540,
    durationHours: 12,
    price: 499,
    originalPrice: 1999,
    shortDescription: "Master the essentials of Microsoft Excel from scratch. Learn cells, basic formulas, formatting, and data management.",
    description: "This course is designed to take you from absolute zero to a confident Excel user. Perfect for students and entry-level professionals who want to understand spreadsheets, create basic tables, write arithmetic formulas, and organize data efficiently.",
    highlights: [
      "15+ hours of step-by-step video lessons",
      "Industry recognized certificate",
      "10+ real-world practice assignments",
      "Dedicated chat & email doubt support",
    ],
    recommendedCourses: [
      "advanced-ms-excel-mastery-course",
      "ms-word-powerpoint-essentials-with-ai-course",
    ],
    quizzes: [
      { title: "Excel Fundamentals Quiz", link: "https://forms.gle/sampleExcelQuiz1" },
      { title: "Formulas & Arithmetic Test", link: "https://forms.gle/sampleExcelQuiz2" }
    ],
    assignments: [
      { title: "Workbook Formatting Assignment", link: "https://sheets.google.com/sampleAssignment1" },
      { title: "Sum & Average Practice Sheets", link: "https://sheets.google.com/sampleAssignment2" }
    ],
    classworks: [
      { title: "Class Slide: Introduction to Cells", link: "https://slides.google.com/sampleClasswork1" },
      { title: "Basic Shortcuts Cheat Sheet", link: "https://drive.google.com/sampleCheatSheet" }
    ],
    videos: [
      { title: "1. Introduction to Excel Basics", link: "https://www.youtube.com/watch?v=k1VUZEVuDJ8" },
      { title: "2. Essential Formulas & Functions", link: "https://www.youtube.com/watch?v=0h61NphM030" }
    ]
  },
  {
    tag: "Trending",
    title: "Advanced MS Excel Mastery Course",
    category: "Microsoft Office",
    enrolledCount: 2310,
    durationHours: 24,
    price: 999,
    originalPrice: 3499,
    shortDescription: "Go beyond the basics. Master Advanced Formulas, Pivot Tables, Macros, and Business Dashboards.",
    description: "Unlock the true power of Excel. Taught by Microsoft Certified Trainers, this course covers complex lookups (XLOOKUP, VLOOKUP, INDEX/MATCH), nested conditions, data analysis tools, interactive pivot reports, dynamic charting, and automation to help you stand out in the workplace.",
    highlights: [
      "30+ hours of advanced content",
      "Lifetime access & regular updates",
      "Interactive business dashboard projects",
      "Job-ready resume booster certificate",
    ],
    recommendedCourses: [
      "advance-word-powerpoint-mastery-with-ai-course",
    ],
    quizzes: [
      { title: "VLOOKUP & XLOOKUP Master Test", link: "https://forms.gle/sampleAdvExcelQuiz1" },
      { title: "Macros & Pivot Tables Assessment", link: "https://forms.gle/sampleAdvExcelQuiz2" }
    ],
    assignments: [
      { title: "Interactive Business Dashboard Project", link: "https://sheets.google.com/sampleAdvAssignment1" },
      { title: "Automation Macro VBA Exercises", link: "https://sheets.google.com/sampleAdvAssignment2" }
    ],
    classworks: [
      { title: "Class Slide: Advanced Lookup Logic", link: "https://slides.google.com/sampleAdvClasswork1" },
      { title: "Dynamic Charting Guidelines PDF", link: "https://drive.google.com/sampleChartsGuidelines" }
    ],
    videos: [
      { title: "1. Advanced Lookup Formulas (XLOOKUP)", link: "https://www.youtube.com/watch?v=0y03N8Yv9j0" },
      { title: "2. Building Interactive Dashboards", link: "https://www.youtube.com/watch?v=K74_FNnlbZM" }
    ]
  },
  {
    tag: "Popular",
    title: "MS Word & PowerPoint Essentials with AI Course",
    category: "Microsoft Office",
    enrolledCount: 890,
    durationHours: 10,
    price: 499,
    originalPrice: 1999,
    shortDescription: "Build professional documents and engaging presentations quickly with the help of AI tools.",
    description: "Master document formatting, layouts, and style guides in Word, alongside slide design, layout hierarchy, animations, and transitions in PowerPoint. Learn to leverage AI prompts (ChatGPT, Claude) to draft templates and outlines instantly.",
    highlights: [
      "12+ hours of video lessons",
      "AI prompt templates for writing & design",
      "Step-by-step presentation creation projects",
      "Certificate of completion",
    ],
    recommendedCourses: [
      "advance-word-powerpoint-mastery-with-ai-course",
      "ms-excel-essentials-course",
    ],
    quizzes: [
      { title: "Document Layouts & Formats Quiz", link: "https://forms.gle/sampleWordQuiz1" },
      { title: "Slide Layout Hierarchy Test", link: "https://forms.gle/sampleWordQuiz2" }
    ],
    assignments: [
      { title: "Corporate Flyer Design Assignment", link: "https://drive.google.com/sampleWordAssignment1" },
      { title: "10-Slide Pitch Deck Creation", link: "https://slides.google.com/sampleWordAssignment2" }
    ],
    classworks: [
      { title: "Class Slide: Principles of Design", link: "https://slides.google.com/sampleWordClasswork1" },
      { title: "ChatGPT Prompt Templates Doc", link: "https://docs.google.com/sampleAIPrompts" }
    ],
    videos: [
      { title: "1. Document Layouts & Styles in Word", link: "https://www.youtube.com/watch?v=1yBnvvPszrs" },
      { title: "2. Dynamic Presentation Slides in PPT", link: "https://www.youtube.com/watch?v=uD9tKk7nQyI" }
    ]
  },
  {
    tag: "Recommended",
    title: "Advance Word & PowerPoint Mastery with AI Course",
    category: "Microsoft Office",
    enrolledCount: 1120,
    durationHours: 20,
    price: 999,
    originalPrice: 3499,
    shortDescription: "Advanced report creation, master templates, and high-impact presentations boosted by AI.",
    description: "Learn to design complex corporate reports, handle mail merge, create developer-level forms, build customized slide masters, and harness Microsoft Copilot and ChatGPT for total document and presentation automation.",
    highlights: [
      "25+ hours of masterclass tutorials",
      "Advanced Copilot & ChatGPT prompt guide",
      "Industry standard formatting templates",
      "Premium professional certificate",
    ],
    recommendedCourses: [
      "advanced-ms-excel-mastery-course",
    ],
    quizzes: [
      { title: "Advanced Formatting & Forms Quiz", link: "https://forms.gle/sampleAdvWordQuiz1" },
      { title: "Copilot Automation Masterclass Test", link: "https://forms.gle/sampleAdvWordQuiz2" }
    ],
    assignments: [
      { title: "Custom Master Slide Layout Project", link: "https://slides.google.com/sampleAdvWordAssignment1" },
      { title: "Automated Mail Merge Report Document", link: "https://docs.google.com/sampleAdvWordAssignment2" }
    ],
    classworks: [
      { title: "Class Slide: Slide Master Setup", link: "https://slides.google.com/sampleAdvWordClasswork1" },
      { title: "Copilot API Integration Playbook", link: "https://drive.google.com/samplePlaybook" }
    ],
    videos: [
      { title: "1. Presentation Slides & Animations Masterclass", link: "https://www.youtube.com/watch?v=hZJszf1b_5E" },
      { title: "2. Automating Documents with Copilot AI", link: "https://www.youtube.com/watch?v=Kz6i_6Hj05s" }
    ]
  },
].map((c) => ({
  ...c,
  slug: slugify(c.title),
  currency: "INR",
  level: "All Levels",
  published: true,
}));

const categories = Array.from(new Set(courses.map((c) => c.category)));

async function seed() {
  await connectDB();

  const email = (process.env.ADMIN_EMAIL ?? "admin@sarvprathamanalytics.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "admin123";
  
  const passwordHash = await bcrypt.hash(password, 10);
  await Admin.findOneAndUpdate({ email }, { email, passwordHash }, { upsert: true });
  console.log(`Admin user ready: ${email}`);

  // Delete previous courses and categories to ensure a clean slate
  await Course.deleteMany({});
  await Category.deleteMany({});
  console.log("Cleared old courses and categories");

  for (const course of courses) {
    await Course.create(course);
  }
  console.log(`Seeded ${courses.length} courses`);

  for (const name of categories) {
    await Category.create({ name });
  }
  console.log(`Seeded ${categories.length} categories`);

  await Testimonial.deleteMany({});
  const initialTestimonials = [
    {
      name: "Neha Kapoor",
      role: "MIS Executive",
      company: "HDFC Life",
      rating: 5,
      text: "Shubham sir's Excel training completely changed how I work. I went from knowing nothing to confidently building pivot reports for my entire department. Got promoted within 4 months.",
      avatarUrl: "",
      videoUrl: "",
    },
    {
      name: "Rahul Sinha",
      role: "Operations Analyst",
      company: "Infosys",
      rating: 5,
      text: "The way he explains complex topics in simple language is unlike any other trainer. I had failed to learn Excel from 3 other courses. Here I understood everything — and landed my first job.",
      avatarUrl: "",
      videoUrl: "",
    },
    {
      name: "Megha Patil",
      role: "Business Analyst",
      company: "TCS",
      rating: 5,
      text: "The AI module was a revelation. I now use Copilot every single day. The bonus Job Skills section helped me crack 3 interviews back to back. This is genuinely the most practical training I've done.",
      avatarUrl: "",
      videoUrl: "",
    },
    {
      name: "Riya Sharma",
      role: "Team Lead - MIS",
      company: "Sarvpratham Alum",
      rating: 5,
      text: "This course has been a game-changer for me. The content is engaging, informative, and relevant to my career goals. I highly recommend it!",
      avatarUrl: "",
      videoUrl: "",
    },
  ];
  for (const t of initialTestimonials) {
    await Testimonial.create(t);
  }
  console.log(`Seeded ${initialTestimonials.length} testimonials`);

  await mongoose.disconnect();
}

seed()
  .then(() => {
    console.log("Seed complete");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed:", err.message);
    process.exit(1);
  });
