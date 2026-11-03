import { daysUntil, isDeadlinePassed, normaliseSkill } from "@/lib/domain/format";
import {
  LOCATION_MODES,
  OPPORTUNITY_CATEGORIES,
  type LocationMode,
  type Opportunity,
  type OpportunityCategory,
} from "@/lib/domain/types";

export const SORT_OPTIONS = ["relevance", "deadline", "recent"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export const DEADLINE_WINDOWS = ["any", "7", "30", "90"] as const;
export type DeadlineWindow = (typeof DEADLINE_WINDOWS)[number];

export interface OpportunityFilters {
  query: string;
  categories: OpportunityCategory[];
  locationModes: LocationMode[];
  deadlineWithin: DeadlineWindow;
  paidOnly: boolean;
  includeClosed: boolean;
  sort: SortOption;
}

export const DEFAULT_FILTERS: OpportunityFilters = {
  query: "",
  categories: [],
  locationModes: [],
  deadlineWithin: "any",
  paidOnly: false,
  includeClosed: false,
  sort: "relevance",
};

function pickList<T extends string>(values: string[], allowed: readonly T[]): T[] {
  return values.flatMap((value) => value.split(",")).filter((value): value is T =>
    (allowed as readonly string[]).includes(value),
  );
}

type ParamsLike = Pick<URLSearchParams, "get" | "getAll">;

export function parseFilters(params: ParamsLike): OpportunityFilters {
  const sort = params.get("sort");
  const deadline = params.get("deadline");
  return {
    query: params.get("q")?.slice(0, 120) ?? "",
    categories: pickList(params.getAll("category"), OPPORTUNITY_CATEGORIES),
    locationModes: pickList(params.getAll("mode"), LOCATION_MODES),
    deadlineWithin: (DEADLINE_WINDOWS as readonly string[]).includes(deadline ?? "")
      ? (deadline as DeadlineWindow)
      : "any",
    paidOnly: params.get("paid") === "1",
    includeClosed: params.get("closed") === "1",
    sort: (SORT_OPTIONS as readonly string[]).includes(sort ?? "") ? (sort as SortOption) : "relevance",
  };
}

export function filtersToSearchParams(filters: OpportunityFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.categories.length) params.set("category", filters.categories.join(","));
  if (filters.locationModes.length) params.set("mode", filters.locationModes.join(","));
  if (filters.deadlineWithin !== "any") params.set("deadline", filters.deadlineWithin);
  if (filters.paidOnly) params.set("paid", "1");
  if (filters.includeClosed) params.set("closed", "1");
  if (filters.sort !== "relevance") params.set("sort", filters.sort);
  return params;
}

function textScore(opportunity: Opportunity, terms: string[]): number {
  if (terms.length === 0) return 0;
  const title = opportunity.title.toLowerCase();
  const provider = opportunity.providerName.toLowerCase();
  const skills = opportunity.skills.map(normaliseSkill);
  const tags = opportunity.tags.map(normaliseSkill);
  const body = `${opportunity.summary} ${opportunity.description}`.toLowerCase();
  let score = 0;
  for (const term of terms) {
    let termScore = 0;
    if (title.includes(term)) termScore += 5;
    if (provider.includes(term)) termScore += 4;
    if (skills.some((skill) => skill.includes(term))) termScore += 3;
    if (tags.some((tag) => tag.includes(term))) termScore += 2;
    if (body.includes(term)) termScore += 1;
    if (termScore === 0) return 0;
    score += termScore;
  }
  return score;
}

const PAID_TYPES = new Set(["stipend", "salary", "funding", "prize", "tuition_waiver"]);

export function filterOpportunities(
  opportunities: Opportunity[],
  filters: OpportunityFilters,
  now: Date = new Date(),
): Opportunity[] {
  const terms = filters.query.toLowerCase().split(/\s+/).filter(Boolean);
  const scored = opportunities
    .filter((opportunity) => filters.includeClosed || !isDeadlinePassed(opportunity, now))
    .filter((opportunity) => !filters.categories.length || filters.categories.includes(opportunity.category))
    .filter((opportunity) => !filters.locationModes.length || filters.locationModes.includes(opportunity.locationMode))
    .filter((opportunity) => !filters.paidOnly || PAID_TYPES.has(opportunity.compensation.type))
    .filter((opportunity) => {
      if (filters.deadlineWithin === "any") return true;
      if (!opportunity.deadline) return false;
      const days = daysUntil(opportunity.deadline, now);
      return days >= 0 && days <= Number(filters.deadlineWithin);
    })
    .map((opportunity) => ({ opportunity, text: textScore(opportunity, terms) }))
    .filter(({ text }) => terms.length === 0 || text > 0);

  const byDeadline = (a: Opportunity, b: Opportunity) => {
    if (!a.deadline && !b.deadline) return 0;
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  };
  const byRecent = (a: Opportunity, b: Opportunity) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();

  scored.sort((a, b) => {
    if (filters.sort === "deadline") return byDeadline(a.opportunity, b.opportunity);
    if (filters.sort === "recent") return byRecent(a.opportunity, b.opportunity);
    return b.text - a.text || byDeadline(a.opportunity, b.opportunity);
  });

  return scored.map(({ opportunity }) => opportunity);
}
