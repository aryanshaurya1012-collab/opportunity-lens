export const OPPORTUNITY_CATEGORIES = [
  "internship",
  "scholarship",
  "hackathon",
  "fellowship",
  "research",
  "grant_competition",
  "workshop_program",
] as const;
export type OpportunityCategory = (typeof OPPORTUNITY_CATEGORIES)[number];

export const LOCATION_MODES = ["remote", "onsite", "hybrid"] as const;
export type LocationMode = (typeof LOCATION_MODES)[number];

export type OpportunityStatus = "draft" | "published" | "unpublished" | "expired";

export type VerificationStatus =
  | "unverified"
  | "verified"
  | "needs_reverification"
  | "source_unreachable";

export type CompensationType =
  | "stipend"
  | "salary"
  | "funding"
  | "prize"
  | "tuition_waiver"
  | "none"
  | "unspecified";

export const DEGREE_LEVELS = [
  "diploma",
  "undergraduate",
  "postgraduate",
  "doctoral",
] as const;
export type DegreeLevel = (typeof DEGREE_LEVELS)[number];

export const GRADE_SCALES = ["cgpa_10", "cgpa_4", "percentage"] as const;
export type GradeScale = (typeof GRADE_SCALES)[number];

export const FIELDS_OF_STUDY = [
  "Computer Science",
  "Information Technology",
  "Data Science",
  "Electronics & Communication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology & Life Sciences",
  "Biotechnology",
  "Medicine & Health",
  "Economics",
  "Business & Management",
  "Design",
  "Law",
  "Humanities",
  "Social Sciences",
  "Other",
] as const;
export type FieldOfStudy = (typeof FIELDS_OF_STUDY)[number];

export const EXPERIENCE_KINDS = [
  "project",
  "internship",
  "work",
  "research",
  "hackathon",
  "volunteer",
] as const;
export type ExperienceKind = (typeof EXPERIENCE_KINDS)[number];

interface RequirementBase {
  id: string;
  /** Mandatory requirements decide eligibility; others are "preferred". */
  mandatory: boolean;
  /** The provider's wording, shown verbatim as evidence. */
  statedText: string;
}

export type Requirement =
  | (RequirementBase & { kind: "degree_level"; levels: DegreeLevel[] })
  | (RequirementBase & { kind: "field_of_study"; fields: FieldOfStudy[] })
  | (RequirementBase & { kind: "academic_year"; min?: number; max?: number })
  | (RequirementBase & { kind: "graduation_year"; min?: number; max?: number })
  | (RequirementBase & { kind: "min_grade"; value: number; scale: GradeScale })
  | (RequirementBase & {
      kind: "skills";
      skills: string[];
      match: "all" | "any";
    })
  | (RequirementBase & {
      kind: "experience";
      experienceKinds: ExperienceKind[];
      minCount: number;
    })
  | (RequirementBase & { kind: "location"; countries: string[] })
  | (RequirementBase & { kind: "citizenship"; countries: string[] })
  | (RequirementBase & { kind: "age"; min?: number; max?: number })
  | (RequirementBase & { kind: "other" });

export type RequirementKind = Requirement["kind"];

export interface Compensation {
  type: CompensationType;
  amountMin?: number;
  amountMax?: number;
  currency?: string;
  period?: "month" | "year" | "total";
  note?: string;
}

export interface Opportunity {
  id: string;
  slug: string;
  title: string;
  providerName: string;
  providerUrl: string | null;
  category: OpportunityCategory;
  summary: string;
  description: string;
  benefits: string[];
  compensation: Compensation;
  locationMode: LocationMode;
  locations: string[];
  /** ISO date-time. null when applications are rolling or undisclosed. */
  deadline: string | null;
  isRolling: boolean;
  startDate: string | null;
  duration: string | null;
  skills: string[];
  tags: string[];
  requirements: Requirement[];
  applicationUrl: string | null;
  sourceUrl: string | null;
  status: OpportunityStatus;
  verificationStatus: VerificationStatus;
  lastVerifiedAt: string | null;
  publishedAt: string;
  /** Demonstration records are never real, verified or currently open. */
  isDemo: boolean;
}

export interface Experience {
  id: string;
  kind: ExperienceKind;
  title: string;
  organization: string;
  description: string;
  skills: string[];
}

/** Collected only with explicit consent, and only when a requirement needs it. */
export interface SensitiveDetails {
  consentGivenAt: string;
  dateOfBirth: string | null;
  citizenship: string | null;
}

export interface Grade {
  value: number;
  scale: GradeScale;
}

export interface StudentProfile {
  fullName: string;
  institution: string;
  degreeLevel: DegreeLevel | null;
  degree: string;
  fieldOfStudy: FieldOfStudy | null;
  academicYear: number | null;
  graduationYear: number | null;
  grade: Grade | null;
  skills: string[];
  interests: string[];
  preferredCategories: OpportunityCategory[];
  country: string;
  city: string;
  experiences: Experience[];
  sensitive: SensitiveDetails | null;
  updatedAt: string;
}

export const APPLICATION_STATUSES = [
  "interested",
  "preparing",
  "applied",
  "under_review",
  "interview",
  "accepted",
  "rejected",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface Application {
  id: string;
  opportunityId: string;
  status: ApplicationStatus;
  personalDeadline: string | null;
  notes: string;
  checklist: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface SavedOpportunity {
  opportunityId: string;
  savedAt: string;
}
