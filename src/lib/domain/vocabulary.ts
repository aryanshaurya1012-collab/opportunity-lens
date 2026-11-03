import type { Opportunity } from "./types";

function topValues(values: string[], limit: number): string[] {
  const counts = new Map<string, { value: string; count: number }>();
  for (const value of values) {
    const key = value.toLowerCase();
    const entry = counts.get(key);
    if (entry) entry.count += 1;
    else counts.set(key, { value, count: 1 });
  }
  return [...counts.values()]
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
    .slice(0, limit)
    .map((entry) => entry.value);
}

/** Skill and interest suggestions derived from the live catalogue, so profiles use matching vocabulary. */
export function catalogueVocabulary(opportunities: Opportunity[]): { skills: string[]; interests: string[] } {
  return {
    skills: topValues(
      opportunities.flatMap((opportunity) => [
        ...opportunity.skills,
        ...opportunity.requirements.flatMap((requirement) => (requirement.kind === "skills" ? requirement.skills : [])),
      ]),
      40,
    ),
    interests: topValues(opportunities.flatMap((opportunity) => opportunity.tags), 30),
  };
}
