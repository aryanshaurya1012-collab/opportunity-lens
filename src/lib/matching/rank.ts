import { evaluateEligibility, type EligibilityResult } from "@/lib/eligibility";
import { CATEGORY_LABELS } from "@/lib/domain/labels";
import { daysUntil, isDeadlinePassed, normaliseSkill } from "@/lib/domain/format";
import type { Opportunity, StudentProfile } from "@/lib/domain/types";

export interface MatchResult {
  opportunity: Opportunity;
  score: number;
  eligibility: EligibilityResult;
  reasons: string[];
  matchedSkills: string[];
}

const ELIGIBILITY_POINTS = { meets: 40, needs_review: 22, does_not_meet: 0 } as const;

function studentSkills(profile: StudentProfile): Set<string> {
  const skills = new Set(profile.skills.map(normaliseSkill));
  for (const experience of profile.experiences) {
    for (const skill of experience.skills) skills.add(normaliseSkill(skill));
  }
  return skills;
}

export function scoreOpportunity(
  profile: StudentProfile,
  opportunity: Opportunity,
  now: Date = new Date(),
): MatchResult {
  const eligibility = evaluateEligibility(profile, opportunity, now);
  const reasons: string[] = [];
  let score = ELIGIBILITY_POINTS[eligibility.outcome];

  if (eligibility.outcome === "meets") reasons.push("Meets every mandatory requirement");
  else if (eligibility.outcome === "needs_review") reasons.push("Potentially eligible; some details need review");

  const skills = studentSkills(profile);
  const matchedSkills = opportunity.skills.filter((skill) => skills.has(normaliseSkill(skill)));
  if (opportunity.skills.length > 0) {
    score += Math.round((matchedSkills.length / opportunity.skills.length) * 25);
    if (matchedSkills.length > 0) {
      reasons.push(`Uses your skills: ${matchedSkills.slice(0, 3).join(", ")}`);
    }
  } else {
    score += 8;
  }

  if (profile.preferredCategories.includes(opportunity.category)) {
    score += 15;
    reasons.push(`You prefer ${CATEGORY_LABELS[opportunity.category].toLowerCase()} opportunities`);
  }

  const interests = new Set(profile.interests.map(normaliseSkill));
  const matchedInterests = opportunity.tags.filter((tag) => interests.has(normaliseSkill(tag)));
  if (matchedInterests.length > 0) {
    score += Math.min(10, matchedInterests.length * 5);
    reasons.push(`Matches your interest in ${matchedInterests.slice(0, 2).join(" and ")}`);
  }

  const country = profile.country.trim().toLowerCase();
  if (opportunity.locationMode === "remote") {
    score += 5;
  } else if (country && opportunity.locations.some((location) => location.toLowerCase().includes(country))) {
    score += 5;
    reasons.push(`Located in ${profile.country}`);
  }

  if (opportunity.deadline) {
    const days = daysUntil(opportunity.deadline, now);
    if (days >= 0 && days <= 14) {
      score += 5;
      reasons.push(`Deadline in ${days} ${days === 1 ? "day" : "days"}`);
    }
  }

  return {
    opportunity,
    score: Math.min(100, score),
    eligibility,
    reasons,
    matchedSkills,
  };
}

/** Ranks open opportunities for a profile. Closed listings are excluded. */
export function rankOpportunities(
  profile: StudentProfile,
  opportunities: Opportunity[],
  now: Date = new Date(),
): MatchResult[] {
  return opportunities
    .filter((opportunity) => !isDeadlinePassed(opportunity, now))
    .map((opportunity) => scoreOpportunity(profile, opportunity, now))
    .sort((a, b) => b.score - a.score || a.opportunity.title.localeCompare(b.opportunity.title));
}
