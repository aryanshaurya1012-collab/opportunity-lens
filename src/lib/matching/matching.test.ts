import { describe, expect, it } from "vitest";
import { DEMO_OPPORTUNITIES } from "@/data/demo-opportunities";
import { SAMPLE_PROFILE } from "@/data/sample-profile";
import { DEFAULT_FILTERS, filterOpportunities, filtersToSearchParams, parseFilters } from "./filters";
import { rankOpportunities } from "./rank";

const NOW = new Date("2026-11-03T00:00:00.000Z");

describe("rankOpportunities", () => {
  it("excludes closed opportunities and sorts by score", () => {
    const ranked = rankOpportunities(SAMPLE_PROFILE, DEMO_OPPORTUNITIES, NOW);
    expect(ranked.every((match) => !match.opportunity.deadline || new Date(match.opportunity.deadline) >= NOW)).toBe(true);
    for (let index = 1; index < ranked.length; index += 1) {
      expect(ranked[index - 1].score).toBeGreaterThanOrEqual(ranked[index].score);
    }
  });

  it("ranks skill-aligned, preferred-category matches above unrelated ones", () => {
    const ranked = rankOpportunities(SAMPLE_PROFILE, DEMO_OPPORTUNITIES, NOW);
    const frontend = ranked.findIndex((match) => match.opportunity.slug === "northwind-frontend-engineering-intern");
    const biodiversity = ranked.findIndex((match) => match.opportunity.slug === "biodiversity-field-research-assistantship");
    expect(frontend).toBeLessThan(biodiversity);
    expect(ranked[frontend].reasons.length).toBeGreaterThan(0);
  });

  it("is deterministic", () => {
    const first = rankOpportunities(SAMPLE_PROFILE, DEMO_OPPORTUNITIES, NOW).map((match) => match.opportunity.id);
    const second = rankOpportunities(SAMPLE_PROFILE, DEMO_OPPORTUNITIES, NOW).map((match) => match.opportunity.id);
    expect(first).toEqual(second);
  });
});

describe("filterOpportunities", () => {
  it("hides closed listings unless requested", () => {
    const open = filterOpportunities(DEMO_OPPORTUNITIES, DEFAULT_FILTERS, NOW);
    const all = filterOpportunities(DEMO_OPPORTUNITIES, { ...DEFAULT_FILTERS, includeClosed: true }, NOW);
    expect(all.length).toBeGreaterThan(open.length);
  });

  it("filters by category and location mode", () => {
    const results = filterOpportunities(
      DEMO_OPPORTUNITIES,
      { ...DEFAULT_FILTERS, categories: ["hackathon"], locationModes: ["remote"] },
      NOW,
    );
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((item) => item.category === "hackathon" && item.locationMode === "remote")).toBe(true);
  });

  it("searches title, provider and skills", () => {
    const bySkill = filterOpportunities(DEMO_OPPORTUNITIES, { ...DEFAULT_FILTERS, query: "figma" }, NOW);
    expect(bySkill.map((item) => item.slug)).toContain("young-designers-fellowship");
    const byProvider = filterOpportunities(DEMO_OPPORTUNITIES, { ...DEFAULT_FILTERS, query: "northwind" }, NOW);
    expect(byProvider).toHaveLength(1);
  });

  it("sorts by deadline with rolling listings last", () => {
    const results = filterOpportunities(DEMO_OPPORTUNITIES, { ...DEFAULT_FILTERS, sort: "deadline" }, NOW);
    expect(results.at(-1)?.deadline).toBeNull();
  });

  it("round-trips filters through URL search params", () => {
    const filters = { ...DEFAULT_FILTERS, query: "data", categories: ["internship" as const], paidOnly: true, sort: "recent" as const };
    expect(parseFilters(filtersToSearchParams(filters))).toEqual(filters);
  });

  it("drops unknown values from URL params", () => {
    const parsed = parseFilters(new URLSearchParams("category=internship,bogus&sort=nope&deadline=5"));
    expect(parsed.categories).toEqual(["internship"]);
    expect(parsed.sort).toBe("relevance");
    expect(parsed.deadlineWithin).toBe("any");
  });
});
