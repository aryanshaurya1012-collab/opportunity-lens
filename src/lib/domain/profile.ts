import type { StudentProfile } from "./types";

export type ProfileDraft = Omit<StudentProfile, "updatedAt">;

export function emptyProfile(): ProfileDraft {
  return {
    fullName: "",
    institution: "",
    degreeLevel: null,
    degree: "",
    fieldOfStudy: null,
    academicYear: null,
    graduationYear: null,
    grade: null,
    skills: [],
    interests: [],
    preferredCategories: [],
    country: "India",
    city: "",
    experiences: [],
    sensitive: null,
  };
}

const COMPLETION_CHECKS: { label: string; done: (profile: ProfileDraft) => boolean }[] = [
  { label: "Name", done: (p) => p.fullName.trim().length > 0 },
  { label: "College / university", done: (p) => p.institution.trim().length > 0 },
  { label: "Level of study", done: (p) => p.degreeLevel !== null },
  { label: "Field of study", done: (p) => p.fieldOfStudy !== null },
  { label: "Current year", done: (p) => p.academicYear !== null },
  { label: "Graduation year", done: (p) => p.graduationYear !== null },
  { label: "CGPA / percentage", done: (p) => p.grade !== null },
  { label: "At least 3 skills", done: (p) => p.skills.length >= 3 },
  { label: "Areas of interest", done: (p) => p.interests.length > 0 },
  { label: "Preferred categories", done: (p) => p.preferredCategories.length > 0 },
  { label: "Country", done: (p) => p.country.trim().length > 0 },
  { label: "A project or experience", done: (p) => p.experiences.length > 0 },
];

export function profileCompletion(profile: ProfileDraft | null): { percent: number; missing: string[] } {
  if (!profile) return { percent: 0, missing: COMPLETION_CHECKS.map((check) => check.label) };
  const missing = COMPLETION_CHECKS.filter((check) => !check.done(profile)).map((check) => check.label);
  return {
    percent: Math.round(((COMPLETION_CHECKS.length - missing.length) / COMPLETION_CHECKS.length) * 100),
    missing,
  };
}

export type ProfileErrors = Partial<Record<"fullName" | "institution" | "graduationYear" | "grade" | "dateOfBirth", string>>;

const GRADE_MAX = { cgpa_10: 10, cgpa_4: 4, percentage: 100 } as const;

export function validateProfile(profile: ProfileDraft, currentYear: number): ProfileErrors {
  const errors: ProfileErrors = {};
  if (!profile.fullName.trim()) errors.fullName = "Enter your name.";
  else if (profile.fullName.length > 120) errors.fullName = "Keep your name under 120 characters.";
  if (!profile.institution.trim()) errors.institution = "Enter your college or university.";
  if (
    profile.graduationYear !== null &&
    (profile.graduationYear < currentYear - 10 || profile.graduationYear > currentYear + 8)
  ) {
    errors.graduationYear = `Enter a year between ${currentYear - 10} and ${currentYear + 8}.`;
  }
  if (profile.grade !== null) {
    const max = GRADE_MAX[profile.grade.scale];
    if (!Number.isFinite(profile.grade.value) || profile.grade.value < 0 || profile.grade.value > max) {
      errors.grade = `Enter a value between 0 and ${max}.`;
    }
  }
  if (profile.sensitive?.dateOfBirth) {
    const dob = new Date(profile.sensitive.dateOfBirth);
    if (Number.isNaN(dob.getTime()) || dob.getUTCFullYear() < currentYear - 80 || dob.getUTCFullYear() > currentYear - 10) {
      errors.dateOfBirth = "Enter a valid date of birth.";
    }
  }
  return errors;
}
