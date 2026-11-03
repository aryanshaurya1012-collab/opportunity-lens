import type { EligibilityOutcome, ProfileField, RequirementStatus } from "./types";

export const OUTCOME_LABELS: Record<EligibilityOutcome, string> = {
  meets: "Meets stated requirements",
  needs_review: "Potentially eligible / needs review",
  does_not_meet: "Does not meet stated requirements",
};

export const OUTCOME_SHORT_LABELS: Record<EligibilityOutcome, string> = {
  meets: "Meets requirements",
  needs_review: "Needs review",
  does_not_meet: "Does not meet",
};

export const REQUIREMENT_STATUS_LABELS: Record<RequirementStatus, string> = {
  met: "Met",
  not_met: "Not met",
  unknown: "Missing information",
  manual_review: "Manual review",
};

export const PROFILE_FIELD_LABELS: Record<ProfileField, string> = {
  degreeLevel: "Level of study",
  fieldOfStudy: "Field of study",
  academicYear: "Current year of study",
  graduationYear: "Graduation year",
  grade: "CGPA / percentage",
  skills: "Skills",
  experiences: "Projects & experience",
  country: "Country",
  citizenship: "Citizenship (optional)",
  dateOfBirth: "Date of birth (optional)",
};
