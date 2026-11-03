import type { StudentProfile } from "@/lib/domain/types";

/**
 * Fictional student used only to illustrate the eligibility engine on the marketing site
 * and to pre-fill the "try with a sample profile" option in demo mode.
 */
export const SAMPLE_PROFILE: StudentProfile = {
  fullName: "Aanya Sharma (sample)",
  institution: "Sample Institute of Technology",
  degreeLevel: "undergraduate",
  degree: "B.Tech",
  fieldOfStudy: "Computer Science",
  academicYear: 3,
  graduationYear: 2028,
  grade: { value: 8.4, scale: "cgpa_10" },
  skills: ["React", "TypeScript", "Python", "Git", "SQL"],
  interests: ["web development", "ai", "climate", "open source"],
  preferredCategories: ["internship", "hackathon", "research"],
  country: "India",
  city: "Bengaluru",
  experiences: [
    {
      id: "sample-exp-1",
      kind: "project",
      title: "Campus events web app",
      organization: "Personal project",
      description: "Built a Next.js app used by student clubs to publish events.",
      skills: ["React", "TypeScript", "CSS"],
    },
    {
      id: "sample-exp-2",
      kind: "hackathon",
      title: "Inter-college hackathon finalist",
      organization: "College team",
      description: "Prototype for crop disease detection.",
      skills: ["Python", "Machine Learning"],
    },
  ],
  sensitive: null,
  updatedAt: "2026-11-01T00:00:00.000Z",
};
