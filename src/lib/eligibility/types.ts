import type { RequirementKind } from "@/lib/domain/types";

export type EligibilityOutcome = "meets" | "needs_review" | "does_not_meet";

export type RequirementStatus = "met" | "not_met" | "unknown" | "manual_review";

/** Profile fields the student can fill in to resolve an "unknown" result. */
export type ProfileField =
  | "degreeLevel"
  | "fieldOfStudy"
  | "academicYear"
  | "graduationYear"
  | "grade"
  | "skills"
  | "experiences"
  | "country"
  | "citizenship"
  | "dateOfBirth";

export interface RequirementResult {
  requirementId: string;
  kind: RequirementKind;
  label: string;
  statedText: string;
  mandatory: boolean;
  status: RequirementStatus;
  /** What the profile says, rendered for display. null when missing. */
  profileValue: string | null;
  /** Plain-language explanation of how the status was reached. */
  explanation: string;
  missingField?: ProfileField;
  recommendation?: string;
}

export interface Recommendation {
  requirementId: string;
  priority: "high" | "medium" | "low";
  text: string;
  action?: { kind: "complete_profile"; field: ProfileField };
}

export interface EligibilityResult {
  outcome: EligibilityOutcome;
  results: RequirementResult[];
  missingFields: ProfileField[];
  recommendations: Recommendation[];
  counts: Record<RequirementStatus, number>;
  headline: string;
  engine: "rules_v1";
  evaluatedAt: string;
}
