import type {
  Application,
  ApplicationStatus,
  OpportunityCategory,
  SavedOpportunity,
  StudentProfile,
} from "@/lib/domain/types";
import type { EligibilityOutcome, ProfileField, RequirementStatus } from "@/lib/eligibility";

export interface StoredAssessment {
  id: string;
  opportunityId: string;
  outcome: EligibilityOutcome;
  counts: Record<RequirementStatus, number>;
  missingFields: ProfileField[];
  engine: "rules_v1";
  evaluatedAt: string;
}

export interface UserDataState {
  version: 1;
  profile: StudentProfile | null;
  saved: SavedOpportunity[];
  applications: Application[];
  assessments: StoredAssessment[];
}

export type ApplicationPatch = Partial<
  Pick<Application, "status" | "personalDeadline" | "notes" | "checklist">
>;

/**
 * Mutations available to the UI. The demo implementation persists to localStorage; the
 * Supabase implementation (P1) will call server actions with the same signatures.
 */
export interface UserDataActions {
  saveProfile(profile: Omit<StudentProfile, "updatedAt">): void;
  toggleSaved(opportunityId: string): void;
  trackApplication(input: {
    opportunityId: string;
    category: OpportunityCategory;
    status?: ApplicationStatus;
    personalDeadline?: string | null;
  }): string;
  updateApplication(applicationId: string, patch: ApplicationPatch): void;
  removeApplication(applicationId: string): void;
  recordAssessment(assessment: Omit<StoredAssessment, "id">): void;
  resetAll(): void;
}
