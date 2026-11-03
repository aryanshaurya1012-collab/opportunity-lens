import type { Opportunity } from "@/lib/domain/types";

/**
 * Read access to published opportunities. Implemented by the local demo provider today
 * and by a Supabase provider (RLS: status = 'published') in the P1 milestone.
 */
export interface OpportunityRepository {
  readonly source: "demo" | "supabase";
  listPublished(): Promise<Opportunity[]>;
  getBySlug(slug: string): Promise<Opportunity | null>;
}
