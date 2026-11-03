import { formatCompensation, formatDate, formatGrade } from "@/lib/domain/format";
import { CATEGORY_LABELS, DEGREE_LEVEL_LABELS, EXPERIENCE_KIND_LABELS } from "@/lib/domain/labels";
import type { Opportunity, StudentProfile } from "@/lib/domain/types";

/**
 * Plain-text context a student can copy into an external AI tool themselves.
 * Sensitive details (citizenship, date of birth) are deliberately excluded.
 */
export function buildProfileSummary(profile: StudentProfile): string {
  const lines = [
    "STUDENT PROFILE",
    `Level: ${profile.degreeLevel ? DEGREE_LEVEL_LABELS[profile.degreeLevel] : "Not stated"}${profile.degree ? ` (${profile.degree})` : ""}`,
    `Field of study: ${profile.fieldOfStudy ?? "Not stated"}`,
    `Year of study: ${profile.academicYear ?? "Not stated"}`,
    `Graduation year: ${profile.graduationYear ?? "Not stated"}`,
    `Academic score: ${profile.grade ? formatGrade(profile.grade) : "Not stated"}`,
    `Country: ${profile.country || "Not stated"}`,
    `Skills: ${profile.skills.join(", ") || "None listed"}`,
    `Interests: ${profile.interests.join(", ") || "None listed"}`,
  ];
  if (profile.experiences.length) {
    lines.push("Experience:");
    for (const experience of profile.experiences) {
      lines.push(
        `- ${EXPERIENCE_KIND_LABELS[experience.kind]}: ${experience.title}${experience.organization ? ` (${experience.organization})` : ""}${
          experience.skills.length ? ` — skills: ${experience.skills.join(", ")}` : ""
        }`,
      );
    }
  }
  return lines.join("\n");
}

export function buildOpportunitySummary(opportunity: Opportunity): string {
  const lines = [
    "OPPORTUNITY",
    `${opportunity.title} — ${opportunity.providerName}${opportunity.isDemo ? " [FICTIONAL DEMO LISTING]" : ""}`,
    `Category: ${CATEGORY_LABELS[opportunity.category]}`,
    `Deadline: ${opportunity.deadline ? formatDate(opportunity.deadline) : opportunity.isRolling ? "Rolling" : "Not stated"}`,
    `Benefit: ${formatCompensation(opportunity.compensation)}`,
    `Description: ${opportunity.description}`,
    "Stated requirements:",
    ...opportunity.requirements.map(
      (requirement) => `- ${requirement.statedText}${requirement.mandatory ? "" : " (preferred)"}`,
    ),
  ];
  if (opportunity.sourceUrl) lines.push(`Source: ${opportunity.sourceUrl}`);
  return lines.join("\n");
}
