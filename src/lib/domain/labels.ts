import type {
  ApplicationStatus,
  CompensationType,
  DegreeLevel,
  ExperienceKind,
  GradeScale,
  LocationMode,
  OpportunityCategory,
  VerificationStatus,
} from "./types";

export const CATEGORY_LABELS: Record<OpportunityCategory, string> = {
  internship: "Internship",
  scholarship: "Scholarship",
  hackathon: "Hackathon",
  fellowship: "Fellowship",
  research: "Research programme",
  grant_competition: "Grant / Competition",
  workshop_program: "Workshop / Programme",
};

export const CATEGORY_PLURAL_LABELS: Record<OpportunityCategory, string> = {
  internship: "Internships",
  scholarship: "Scholarships",
  hackathon: "Hackathons",
  fellowship: "Fellowships",
  research: "Research programmes",
  grant_competition: "Grants & competitions",
  workshop_program: "Workshops & programmes",
};

export const LOCATION_MODE_LABELS: Record<LocationMode, string> = {
  remote: "Remote",
  onsite: "On-site",
  hybrid: "Hybrid",
};

export const VERIFICATION_LABELS: Record<VerificationStatus, string> = {
  verified: "Source verified",
  unverified: "Not verified",
  needs_reverification: "Needs re-verification",
  source_unreachable: "Source unreachable",
};

export const COMPENSATION_LABELS: Record<CompensationType, string> = {
  stipend: "Stipend",
  salary: "Salary",
  funding: "Funding",
  prize: "Prize",
  tuition_waiver: "Tuition waiver",
  none: "Unpaid",
  unspecified: "Not specified",
};

export const DEGREE_LEVEL_LABELS: Record<DegreeLevel, string> = {
  diploma: "Diploma",
  undergraduate: "Undergraduate",
  postgraduate: "Postgraduate",
  doctoral: "Doctoral",
};

export const GRADE_SCALE_LABELS: Record<GradeScale, string> = {
  cgpa_10: "CGPA (out of 10)",
  cgpa_4: "GPA (out of 4)",
  percentage: "Percentage",
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  interested: "Interested",
  preparing: "Preparing",
  applied: "Applied",
  under_review: "Under review",
  interview: "Interview",
  accepted: "Accepted",
  rejected: "Rejected",
};

export const EXPERIENCE_KIND_LABELS: Record<ExperienceKind, string> = {
  project: "Project",
  internship: "Internship",
  work: "Work",
  research: "Research",
  hackathon: "Hackathon",
  volunteer: "Volunteering",
};
