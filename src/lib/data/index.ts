import { dataMode } from "@/lib/config";
import { demoOpportunityRepository } from "./demo-opportunity-repository";
import type { OpportunityRepository } from "./opportunity-repository";

export type { OpportunityRepository } from "./opportunity-repository";

export function getOpportunityRepository(): OpportunityRepository {
  switch (dataMode) {
    case "demo":
      return demoOpportunityRepository;
    default:
      throw new Error(`No opportunity repository implemented for data mode "${dataMode}".`);
  }
}
