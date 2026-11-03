import type { Metadata } from "next";
import { Suspense } from "react";
import { OpportunityExplorer, OpportunityExplorerSkeleton } from "@/components/opportunities/opportunity-explorer";
import { getOpportunityRepository } from "@/lib/data";

export const metadata: Metadata = {
  title: "Discover opportunities",
  description: "Search internships, scholarships, hackathons, fellowships, research programmes, grants and workshops.",
};

export default async function OpportunitiesPage() {
  const opportunities = await getOpportunityRepository().listPublished();

  return (
    <div className="container-page space-y-10 py-12 md:py-16">
      <header className="max-w-2xl space-y-3">
        <h1 className="font-display text-4xl tracking-tight text-navy md:text-5xl">Discover opportunities</h1>
        <p className="text-muted-foreground">
          Search across all seven categories. Open any listing to see its stated requirements and source, or{" "}
          <a href="/onboarding" className="font-medium text-brand hover:underline">
            build a profile
          </a>{" "}
          to get personalised matches.
        </p>
      </header>
      <Suspense fallback={<OpportunityExplorerSkeleton />}>
        <OpportunityExplorer opportunities={opportunities} detailBasePath="/opportunities" />
      </Suspense>
    </div>
  );
}
