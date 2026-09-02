import type { Course, CourseMaterial, VideoModule } from "@/lib/api";

/**
 * Courses created before module support only have a flat `videos` list.
 * Wrap that as a single implicit module so every consumer can treat
 * `videoModules` as the one source of truth.
 */
export function getCourseModules(course?: Course | null): VideoModule[] {
  if (!course) return [];
  if (course.videoModules && course.videoModules.length > 0) return course.videoModules;
  if (course.videos && course.videos.length > 0) return [{ title: "Lessons", lessons: course.videos }];
  return [];
}

export function flattenLessons(modules: VideoModule[]): CourseMaterial[] {
  return modules.flatMap((m) => m.lessons);
}

export function countLessons(course?: Course | null): number {
  return flattenLessons(getCourseModules(course)).length;
}
