import agileScrum from "@/assets/blog/agile-scrum.svg";
import mockInterviews from "@/assets/blog/mock-interviews.svg";
import resumeTips from "@/assets/blog/resume-tips.svg";
import prepRoadmap from "@/assets/blog/prep-roadmap.svg";

const SLUG_IMAGES: Record<string, string> = {
  "agile-scrum-experience-pm-interviews-2025": agileScrum,
  "mock-interviews-project-manager-interviews": mockInterviews,
  "pm-resume-tips-tier-1-companies": resumeTips,
  "pm-interview-preparation-roadmap": prepRoadmap,
};

export function getBlogImage(slug: string): string {
  return SLUG_IMAGES[slug] ?? agileScrum;
}
