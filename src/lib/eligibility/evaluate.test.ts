import { describe, expect, it } from "vitest";
import type { Opportunity, Requirement, StudentProfile } from "@/lib/domain/types";
import { evaluateEligibility } from "./evaluate";

const NOW = new Date("2026-11-03T00:00:00.000Z");

function profile(overrides: Partial<StudentProfile> = {}): StudentProfile {
  return {
    fullName: "Test Student",
    institution: "Test University",
    degreeLevel: "undergraduate",
    degree: "B.Tech",
    fieldOfStudy: "Computer Science",
    academicYear: 3,
    graduationYear: 2028,
    grade: { value: 8.2, scale: "cgpa_10" },
    skills: ["React", "TypeScript"],
    interests: [],
    preferredCategories: [],
    country: "India",
    city: "Pune",
    experiences: [],
    sensitive: null,
    updatedAt: NOW.toISOString(),
    ...overrides,
  };
}

function opportunity(requirements: Requirement[], overrides: Partial<Opportunity> = {}): Opportunity {
  return {
    id: "o1",
    slug: "o1",
    title: "Test opportunity",
    providerName: "Provider",
    providerUrl: null,
    category: "internship",
    summary: "",
    description: "",
    benefits: [],
    compensation: { type: "none" },
    locationMode: "remote",
    locations: [],
    deadline: "2026-12-31T00:00:00.000Z",
    isRolling: false,
    startDate: null,
    duration: null,
    skills: [],
    tags: [],
    requirements,
    applicationUrl: null,
    sourceUrl: null,
    status: "published",
    verificationStatus: "unverified",
    lastVerifiedAt: null,
    publishedAt: NOW.toISOString(),
    isDemo: true,
    ...overrides,
  };
}

const base = { mandatory: true, statedText: "stated" } as const;

describe("evaluateEligibility outcomes", () => {
  it("meets when every mandatory requirement is met", () => {
    const result = evaluateEligibility(
      profile(),
      opportunity([
        { ...base, id: "a", kind: "degree_level", levels: ["undergraduate"] },
        { ...base, id: "b", kind: "skills", skills: ["React"], match: "all" },
      ]),
      NOW,
    );
    expect(result.outcome).toBe("meets");
    expect(result.counts.met).toBe(2);
  });

  it("does not meet when any mandatory requirement fails", () => {
    const result = evaluateEligibility(
      profile({ academicYear: 1 }),
      opportunity([
        { ...base, id: "a", kind: "academic_year", min: 2 },
        { ...base, id: "b", kind: "skills", skills: ["React"], match: "all" },
      ]),
      NOW,
    );
    expect(result.outcome).toBe("does_not_meet");
    expect(result.results[0].status).toBe("not_met");
  });

  it("never treats missing profile data as satisfied", () => {
    const result = evaluateEligibility(
      profile({ grade: null }),
      opportunity([{ ...base, id: "a", kind: "min_grade", value: 7, scale: "cgpa_10" }]),
      NOW,
    );
    expect(result.outcome).toBe("needs_review");
    expect(result.results[0].status).toBe("unknown");
    expect(result.missingFields).toEqual(["grade"]);
    expect(result.recommendations[0].priority).toBe("high");
  });

  it("prefers does_not_meet over needs_review when both apply", () => {
    const result = evaluateEligibility(
      profile({ grade: null, degreeLevel: "postgraduate" }),
      opportunity([
        { ...base, id: "a", kind: "min_grade", value: 7, scale: "cgpa_10" },
        { ...base, id: "b", kind: "degree_level", levels: ["undergraduate"] },
      ]),
      NOW,
    );
    expect(result.outcome).toBe("does_not_meet");
  });

  it("flags free-text conditions for manual review", () => {
    const result = evaluateEligibility(profile(), opportunity([{ ...base, id: "a", kind: "other" }]), NOW);
    expect(result.outcome).toBe("needs_review");
    expect(result.results[0].status).toBe("manual_review");
  });

  it("ignores failed preferred requirements when deciding the outcome", () => {
    const result = evaluateEligibility(
      profile(),
      opportunity([
        { ...base, id: "a", kind: "degree_level", levels: ["undergraduate"] },
        { id: "b", kind: "skills", skills: ["Rust"], match: "all", mandatory: false, statedText: "Rust preferred" },
      ]),
      NOW,
    );
    expect(result.outcome).toBe("meets");
    expect(result.counts.not_met).toBe(1);
    expect(result.recommendations).toHaveLength(1);
  });

  it("returns needs_review when a listing has no structured requirements", () => {
    const result = evaluateEligibility(profile(), opportunity([]), NOW);
    expect(result.outcome).toBe("needs_review");
  });
});

describe("requirement evaluators", () => {
  it("does not convert between grade scales", () => {
    const result = evaluateEligibility(
      profile({ grade: { value: 8.2, scale: "cgpa_10" } }),
      opportunity([{ ...base, id: "a", kind: "min_grade", value: 75, scale: "percentage" }]),
      NOW,
    );
    expect(result.results[0].status).toBe("manual_review");
  });

  it("compares grades on the same scale", () => {
    const below = evaluateEligibility(
      profile({ grade: { value: 6.9, scale: "cgpa_10" } }),
      opportunity([{ ...base, id: "a", kind: "min_grade", value: 7, scale: "cgpa_10" }]),
      NOW,
    );
    expect(below.results[0].status).toBe("not_met");
  });

  it("matches skills case-insensitively and counts skills from experience", () => {
    const result = evaluateEligibility(
      profile({
        skills: ["react"],
        experiences: [
          { id: "e", kind: "project", title: "p", organization: "", description: "", skills: ["Type Script", "typescript"] },
        ],
      }),
      opportunity([{ ...base, id: "a", kind: "skills", skills: ["React", "TypeScript"], match: "all" }]),
      NOW,
    );
    expect(result.results[0].status).toBe("met");
  });

  it("reports missing skills for 'all' matches", () => {
    const result = evaluateEligibility(
      profile({ skills: ["React"] }),
      opportunity([{ ...base, id: "a", kind: "skills", skills: ["React", "Go"], match: "all" }]),
      NOW,
    );
    expect(result.results[0].status).toBe("not_met");
    expect(result.results[0].explanation).toContain("Go");
  });

  it("treats an empty skills list as unknown rather than not met", () => {
    const result = evaluateEligibility(
      profile({ skills: [] }),
      opportunity([{ ...base, id: "a", kind: "skills", skills: ["React"], match: "any" }]),
      NOW,
    );
    expect(result.results[0].status).toBe("unknown");
  });

  it("requires consented citizenship data before evaluating citizenship", () => {
    const requirement: Requirement = { ...base, id: "a", kind: "citizenship", countries: ["India"] };
    expect(evaluateEligibility(profile(), opportunity([requirement]), NOW).results[0].status).toBe("unknown");
    const withConsent = profile({
      sensitive: { consentGivenAt: NOW.toISOString(), citizenship: "India", dateOfBirth: null },
    });
    expect(evaluateEligibility(withConsent, opportunity([requirement]), NOW).results[0].status).toBe("met");
  });

  it("computes age at the deadline", () => {
    const withDob = profile({
      sensitive: { consentGivenAt: NOW.toISOString(), citizenship: null, dateOfBirth: "1996-12-15" },
    });
    const result = evaluateEligibility(
      withDob,
      opportunity([{ ...base, id: "a", kind: "age", max: 30 }], { deadline: "2027-01-31T00:00:00.000Z" }),
      NOW,
    );
    expect(result.results[0].profileValue).toBe("30 years");
    expect(result.results[0].status).toBe("met");
  });

  it("checks experience counts by kind", () => {
    const withExperience = profile({
      experiences: [{ id: "e", kind: "internship", title: "t", organization: "", description: "", skills: [] }],
    });
    const result = evaluateEligibility(
      withExperience,
      opportunity([{ ...base, id: "a", kind: "experience", experienceKinds: ["research"], minCount: 1 }]),
      NOW,
    );
    expect(result.results[0].status).toBe("not_met");
  });

  it("checks graduation-year ranges", () => {
    const result = evaluateEligibility(
      profile({ graduationYear: 2030 }),
      opportunity([{ ...base, id: "a", kind: "graduation_year", min: 2027, max: 2028 }]),
      NOW,
    );
    expect(result.results[0].status).toBe("not_met");
  });
});
