import agileManagement from "@/assets/courses/agile-management.svg";
import projectManagement from "@/assets/courses/project-management.svg";
import productManagement from "@/assets/courses/product-management.svg";
import productOwner from "@/assets/courses/product-owner.svg";
import devOps from "@/assets/courses/devops.svg";
import softwareTesting from "@/assets/courses/software-testing.svg";
import serviceManagement from "@/assets/courses/service-management.svg";

const CATEGORY_IMAGES: Record<string, string> = {
  "Agile Management": agileManagement,
  "Project Management": projectManagement,
  "Product Management": productManagement,
  "Product Owner": productOwner,
  DevOps: devOps,
  "Software Testing": softwareTesting,
  "Service Management": serviceManagement,
};

export function getCourseImage(category: string, imageUrl?: string): string {
  if (imageUrl) return imageUrl;
  return CATEGORY_IMAGES[category] ?? agileManagement;
}
