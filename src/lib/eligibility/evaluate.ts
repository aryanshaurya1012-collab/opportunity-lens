import {
  CATEGORY_LABELS,
  DEGREE_LEVEL_LABELS,
  EXPERIENCE_KIND_LABELS,
} from "@/lib/domain/labels";
import { formatGrade, normaliseSkill } from "@/lib/domain/format";
import type { Opportunity, Requirement, StudentProfile } from "@/lib/domain/types";
import type {
  EligibilityOutcome,
  EligibilityResult,
  ProfileField,
  Recommendation,
  RequirementResult,
  RequirementStatus,
} from "./types";

type Evaluation = Omit<
  RequirementResult,
  "requirementId" | "kind" | "label" | "statedText" | "mandatory"
>;

const GRADE_SCALE_NAMES = {
  cgpa_10: "a 10-point CGPA scale",
  cgpa_4: "a 4-point GPA scale",
  percentage: "percentage",
} as const;

function listFormat(items: string[], conjunction: "and" | "or" = "or"): string {
  return new Intl.ListFormat("en-GB", { type: conjunction === "and" ? "conjunction" : "disjunction" }).format(items);
}

function rangeText(min?: number, max?: number): string {
  if (min !== undefined && max !== undefined) return min === max ? `${min}` : `${min}–${max}`;
  if (min !== undefined) return `${min} or later`;
  if (max !== undefined) return `${max} or earlier`;
  return "any";
}

function inRange(value: number, min?: number, max?: number): boolean {
  return (min === undefined || value >= min) && (max === undefined || value <= max);
}

function unknown(field: ProfileField, explanation: string, recommendation: string): Evaluation {
  return { status: "unknown", profileValue: null, explanation, missingField: field, recommendation };
}

export function requirementLabel(requirement: Requirement): string {
  switch (requirement.kind) {
    case "degree_level":
      return "Level of study";
    case "field_of_study":
      return "Field of study";
    case "academic_year":
      return "Current year of study";
    case "graduation_year":
      return "Graduation year";
    case "min_grade":
      return "Minimum academic score";
    case "skills":
      return requirement.match === "all" ? "Required skills" : "Relevant skills";
    case "experience":
      return "Prior experience";
    case "location":
      return "Location";
    case "citizenship":
      return "Citizenship";
    case "age":
      return "Age";
    case "other":
      return "Additional condition";
  }
}

function profileSkills(profile: StudentProfile): Set<string> {
  const skills = new Set(profile.skills.map(normaliseSkill));
  for (const experience of profile.experiences) {
    for (const skill of experience.skills) skills.add(normaliseSkill(skill));
  }
  return skills;
}

function ageOn(dateOfBirth: string, reference: Date): number {
  const dob = new Date(dateOfBirth);
  let age = reference.getUTCFullYear() - dob.getUTCFullYear();
  const beforeBirthday =
    reference.getUTCMonth() < dob.getUTCMonth() ||
    (reference.getUTCMonth() === dob.getUTCMonth() && reference.getUTCDate() < dob.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

function evaluateRequirement(
  requirement: Requirement,
  profile: StudentProfile,
  opportunity: Opportunity,
  now: Date,
): Evaluation {
  switch (requirement.kind) {
    case "degree_level": {
      const allowed = requirement.levels.map((level) => DEGREE_LEVEL_LABELS[level]);
      if (!profile.degreeLevel) {
        return unknown("degreeLevel", "Your level of study is not in your profile.", "Add your current level of study.");
      }
      const value = DEGREE_LEVEL_LABELS[profile.degreeLevel];
      return requirement.levels.includes(profile.degreeLevel)
        ? { status: "met", profileValue: value, explanation: `${value} students are eligible.` }
        : {
            status: "not_met",
            profileValue: value,
            explanation: `Open to ${listFormat(allowed)} students; your profile says ${value}.`,
            recommendation: `This opportunity is limited to ${listFormat(allowed)} students. Look for similar ${CATEGORY_LABELS[opportunity.category].toLowerCase()} listings open to your level.`,
          };
    }

    case "field_of_study": {
      if (!profile.fieldOfStudy) {
        return unknown("fieldOfStudy", "Your field of study is not in your profile.", "Add your field of study.");
      }
      const value = profile.fieldOfStudy;
      return requirement.fields.includes(value)
        ? { status: "met", profileValue: value, explanation: `${value} is one of the accepted fields.` }
        : {
            status: "not_met",
            profileValue: value,
            explanation: `Accepted fields are ${listFormat(requirement.fields)}; your profile says ${value}.`,
            recommendation: "Check the source listing for exceptions for interdisciplinary or minor subjects before ruling this out.",
          };
    }

    case "academic_year": {
      if (profile.academicYear === null) {
        return unknown("academicYear", "Your current year of study is not in your profile.", "Add your current year of study.");
      }
      const value = `Year ${profile.academicYear}`;
      const expected = `year ${rangeText(requirement.min, requirement.max).replace(" or later", " or above").replace(" or earlier", " or below")}`;
      return inRange(profile.academicYear, requirement.min, requirement.max)
        ? { status: "met", profileValue: value, explanation: `Students in ${expected} are eligible.` }
        : {
            status: "not_met",
            profileValue: value,
            explanation: `Requires students in ${expected}; you are in ${value.toLowerCase()}.`,
            recommendation: "Note this for a future cycle when your year of study qualifies.",
          };
    }

    case "graduation_year": {
      if (profile.graduationYear === null) {
        return unknown("graduationYear", "Your expected graduation year is not in your profile.", "Add your expected graduation year.");
      }
      const value = String(profile.graduationYear);
      const expected = rangeText(requirement.min, requirement.max);
      return inRange(profile.graduationYear, requirement.min, requirement.max)
        ? { status: "met", profileValue: value, explanation: `Graduating in ${value} falls within ${expected}.` }
        : {
            status: "not_met",
            profileValue: value,
            explanation: `Requires a graduation year of ${expected}; yours is ${value}.`,
            recommendation: "Graduation-year limits are usually strict. Track the next cycle of this opportunity instead.",
          };
    }

    case "min_grade": {
      if (!profile.grade) {
        return unknown("grade", "Your CGPA or percentage is not in your profile.", "Add your current CGPA or percentage.");
      }
      const value = formatGrade(profile.grade);
      const required = formatGrade({ value: requirement.value, scale: requirement.scale });
      if (profile.grade.scale !== requirement.scale) {
        return {
          status: "manual_review",
          profileValue: value,
          explanation: `The requirement uses ${GRADE_SCALE_NAMES[requirement.scale]} (${required}) but your grade is on ${GRADE_SCALE_NAMES[profile.grade.scale]}. Conversion rules differ between institutions, so this is not converted automatically.`,
          recommendation: "Check your institution's official conversion formula or ask the provider how they compare grades.",
        };
      }
      return profile.grade.value >= requirement.value
        ? { status: "met", profileValue: value, explanation: `${value} meets the minimum of ${required}.` }
        : {
            status: "not_met",
            profileValue: value,
            explanation: `${value} is below the stated minimum of ${required}.`,
            recommendation: "Academic minimums are rarely waived. Prioritise opportunities without a grade cut-off or with a lower one.",
          };
    }

    case "skills": {
      const have = profileSkills(profile);
      if (have.size === 0) {
        return unknown("skills", "No skills are listed in your profile or experience.", "Add your skills and the skills used in your projects.");
      }
      const matched = requirement.skills.filter((skill) => have.has(normaliseSkill(skill)));
      const missing = requirement.skills.filter((skill) => !have.has(normaliseSkill(skill)));
      const profileValue = matched.length > 0 ? `Has ${listFormat(matched, "and")}` : "None of the listed skills";
      const satisfied = requirement.match === "all" ? missing.length === 0 : matched.length > 0;
      if (satisfied) {
        return {
          status: "met",
          profileValue,
          explanation:
            requirement.match === "all"
              ? `Your profile lists all required skills: ${listFormat(matched, "and")}.`
              : `Your profile lists ${listFormat(matched, "and")}, which satisfies this requirement.`,
        };
      }
      return {
        status: "not_met",
        profileValue,
        explanation:
          requirement.match === "all"
            ? `Missing from your profile: ${listFormat(missing, "and")}.`
            : `Requires at least one of ${listFormat(requirement.skills)}.`,
        recommendation: `Build and document a small project using ${listFormat(missing.slice(0, 3), "and")}, then add it to your profile.`,
      };
    }

    case "experience": {
      const kinds = requirement.experienceKinds.map((kind) => EXPERIENCE_KIND_LABELS[kind].toLowerCase());
      if (profile.experiences.length === 0) {
        return unknown(
          "experiences",
          "No projects or experience are recorded in your profile, so this cannot be checked.",
          `Add any ${listFormat(kinds)} experience you have.`,
        );
      }
      const count = profile.experiences.filter((experience) =>
        requirement.experienceKinds.includes(experience.kind),
      ).length;
      const profileValue = `${count} matching ${count === 1 ? "entry" : "entries"}`;
      return count >= requirement.minCount
        ? { status: "met", profileValue, explanation: `Requires ${requirement.minCount} ${listFormat(kinds)} ${requirement.minCount === 1 ? "entry" : "entries"}; you have ${count}.` }
        : {
            status: "not_met",
            profileValue,
            explanation: `Requires at least ${requirement.minCount} ${listFormat(kinds)} ${requirement.minCount === 1 ? "entry" : "entries"}; your profile has ${count}.`,
            recommendation: `Add or complete ${requirement.minCount - count} more ${listFormat(kinds)} ${requirement.minCount - count === 1 ? "entry" : "entries"} and record it in your profile.`,
          };
    }

    case "location": {
      if (!profile.country.trim()) {
        return unknown("country", "Your country is not in your profile.", "Add the country you are studying in.");
      }
      const value = profile.country;
      const ok = requirement.countries.some((country) => country.toLowerCase() === value.trim().toLowerCase());
      return ok
        ? { status: "met", profileValue: value, explanation: `Open to students based in ${value}.` }
        : {
            status: "not_met",
            profileValue: value,
            explanation: `Open to students in ${listFormat(requirement.countries)}; your profile says ${value}.`,
          };
    }

    case "citizenship": {
      const citizenship = profile.sensitive?.citizenship ?? null;
      if (!citizenship) {
        return unknown(
          "citizenship",
          "Citizenship is not in your profile. It is optional and only stored with your consent.",
          "If you are comfortable, add your citizenship in the optional eligibility details section.",
        );
      }
      const ok = requirement.countries.some((country) => country.toLowerCase() === citizenship.trim().toLowerCase());
      return ok
        ? { status: "met", profileValue: citizenship, explanation: `Open to citizens of ${citizenship}.` }
        : {
            status: "not_met",
            profileValue: citizenship,
            explanation: `Open to citizens of ${listFormat(requirement.countries)}.`,
          };
    }

    case "age": {
      const dob = profile.sensitive?.dateOfBirth ?? null;
      if (!dob) {
        return unknown(
          "dateOfBirth",
          "Date of birth is not in your profile. It is optional and only stored with your consent.",
          "If you are comfortable, add your date of birth in the optional eligibility details section.",
        );
      }
      const reference = opportunity.deadline ? new Date(opportunity.deadline) : now;
      const age = ageOn(dob, reference);
      const expected = rangeText(requirement.min, requirement.max).replace(" or later", " or older").replace(" or earlier", " or younger");
      return inRange(age, requirement.min, requirement.max)
        ? { status: "met", profileValue: `${age} years`, explanation: `Your age at the deadline (${age}) is within ${expected}.` }
        : {
            status: "not_met",
            profileValue: `${age} years`,
            explanation: `Age must be ${expected} at the deadline; yours would be ${age}.`,
          };
    }

    case "other":
      return {
        status: "manual_review",
        profileValue: null,
        explanation: "This condition cannot be checked automatically. Read it against the original source.",
        recommendation: `Confirm on the provider's page: "${requirement.statedText}"`,
      };
  }
}

const FIXED_KINDS = new Set<Requirement["kind"]>([
  "degree_level",
  "field_of_study",
  "academic_year",
  "graduation_year",
  "min_grade",
  "location",
  "citizenship",
  "age",
]);

function toRecommendation(result: RequirementResult): Recommendation | null {
  if (!result.recommendation || result.status === "met") return null;
  let priority: Recommendation["priority"] = "medium";
  if (result.status === "unknown") priority = result.mandatory ? "high" : "medium";
  else if (result.status === "not_met") {
    const improvable = !FIXED_KINDS.has(result.kind);
    priority = improvable ? (result.mandatory ? "high" : "medium") : "low";
  }
  return {
    requirementId: result.requirementId,
    priority,
    text: result.recommendation,
    action: result.missingField ? { kind: "complete_profile", field: result.missingField } : undefined,
  };
}

const PRIORITY_ORDER: Record<Recommendation["priority"], number> = { high: 0, medium: 1, low: 2 };

function headlineFor(outcome: EligibilityOutcome, results: RequirementResult[]): string {
  const mandatory = results.filter((result) => result.mandatory);
  if (results.length === 0) {
    return "This listing has no structured requirements to check. Review the original source before applying.";
  }
  if (outcome === "does_not_meet") {
    const failed = mandatory.filter((result) => result.status === "not_met").length;
    return `Your profile does not meet ${failed} mandatory ${failed === 1 ? "requirement" : "requirements"}.`;
  }
  if (outcome === "needs_review") {
    const open = mandatory.filter((result) => result.status === "unknown" || result.status === "manual_review").length;
    return `${open} mandatory ${open === 1 ? "requirement needs" : "requirements need"} more information or manual review.`;
  }
  return `Your profile meets all ${mandatory.length} mandatory ${mandatory.length === 1 ? "requirement" : "requirements"} stated for this opportunity.`;
}

export function evaluateEligibility(
  profile: StudentProfile,
  opportunity: Opportunity,
  now: Date = new Date(),
): EligibilityResult {
  const results: RequirementResult[] = opportunity.requirements.map((requirement) => ({
    requirementId: requirement.id,
    kind: requirement.kind,
    label: requirementLabel(requirement),
    statedText: requirement.statedText,
    mandatory: requirement.mandatory,
    ...evaluateRequirement(requirement, profile, opportunity, now),
  }));

  const mandatory = results.filter((result) => result.mandatory);
  let outcome: EligibilityOutcome;
  if (results.length === 0) outcome = "needs_review";
  else if (mandatory.some((result) => result.status === "not_met")) outcome = "does_not_meet";
  else if (mandatory.some((result) => result.status === "unknown" || result.status === "manual_review"))
    outcome = "needs_review";
  else outcome = "meets";

  const counts: Record<RequirementStatus, number> = { met: 0, not_met: 0, unknown: 0, manual_review: 0 };
  for (const result of results) counts[result.status] += 1;

  const missingFields = [
    ...new Set(results.flatMap((result) => (result.missingField ? [result.missingField] : []))),
  ];

  const recommendations = results
    .map(toRecommendation)
    .filter((recommendation): recommendation is Recommendation => recommendation !== null)
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  return {
    outcome,
    results,
    missingFields,
    recommendations,
    counts,
    headline: headlineFor(outcome, results),
    engine: "rules_v1",
    evaluatedAt: now.toISOString(),
  };
}
