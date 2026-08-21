export type BlogPost = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  content: string[];
  views: number;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "agile-scrum-experience-pm-interviews-2025",
    category: "Workplace",
    title: "How to Use Agile & Scrum Experience to Crack PM Interviews in 2025",
    excerpt:
      "Hiring panels are screening harder for real Agile fluency, not just buzzwords. Here's how to prove yours.",
    content: [
      "Project management interviews in 2025 have shifted from theoretical questions to scenario-based Agile assessments. Interviewers want to see how you've actually run a sprint, not just define one.",
      "Lead with outcomes: quantify velocity improvements, cycle-time reductions, or stakeholder satisfaction scores from your Scrum experience.",
      "Be ready to walk through a real retrospective you facilitated — panels use this to gauge whether you can turn process into improvement, not just ritual.",
    ],
    views: 6902,
  },
  {
    slug: "mock-interviews-project-manager-interviews",
    category: "Workplace",
    title: "Why Mock Interviews Are Critical for Project Manager Interviews",
    excerpt:
      "The gap between knowing your material and performing under pressure is where most PM candidates lose offers.",
    content: [
      "Mock interviews expose the difference between knowing an answer and being able to deliver it confidently under time pressure.",
      "Structured feedback after each mock session compounds — candidates who do 3+ mocks report noticeably tighter, more concise answers by their real interview.",
      "Record your mocks. Most candidates are surprised by their own filler words and pacing once they watch it back.",
    ],
    views: 2540,
  },
  {
    slug: "pm-resume-tips-tier-1-companies",
    category: "Workplace",
    title: "Project Manager Resume Tips to Get Shortlisted at Tier-1 Companies",
    excerpt:
      "Tier-1 recruiters spend under 10 seconds on a first resume pass. Here's what needs to be in that window.",
    content: [
      "Lead every bullet with a metric, not a responsibility. 'Managed a team' says nothing; 'Delivered a 12-person cross-functional program 3 weeks early, under budget' gets a second look.",
      "Mirror the certifications the job description names explicitly — PSM, CSM, PMP — recruiters and ATS filters both scan for them.",
      "Cut anything older than 8-10 years unless it's your most impressive achievement. Recency signals relevance.",
    ],
    views: 6902,
  },
  {
    slug: "pm-interview-preparation-roadmap",
    category: "Workplace",
    title: "Step-by-Step PM Interview Preparation Roadmap for Professionals",
    excerpt:
      "A 4-week plan for going from 'applying' to 'offer' without burning out on generic prep advice.",
    content: [
      "Week 1: audit your own project history and build a bank of 8-10 STAR stories covering conflict, failure, leadership, and delivery under constraint.",
      "Week 2: study the specific frameworks the target company uses (Agile, Waterfall, hybrid) and tailor your stories to that language.",
      "Week 3: run at least three mock interviews with feedback, focusing on trimming answers to under two minutes.",
      "Week 4: research the interviewers, prepare sharp questions for them, and rehearse your close.",
    ],
    views: 4292,
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((p) => p.slug === slug);
}
