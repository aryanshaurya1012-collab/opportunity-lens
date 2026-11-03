import { DEMO_OPPORTUNITIES } from "@/data/demo-opportunities";
import type { OpportunityRepository } from "./opportunity-repository";

export const demoOpportunityRepository: OpportunityRepository = {
  source: "demo",
  async listPublished() {
    return DEMO_OPPORTUNITIES.filter((opportunity) => opportunity.status === "published");
  },
  async getBySlug(slug) {
    return DEMO_OPPORTUNITIES.find((opportunity) => opportunity.slug === slug) ?? null;
  },
};
