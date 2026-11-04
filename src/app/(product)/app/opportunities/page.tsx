import type { Metadata } from "next";
import { Suspense } from "react";
import { PageShell } from "@/components/app-shell/page-shell";
import { PageContainer, PageHeader } from "@/components/app-shell/page-header";
import { OpportunityExplorer, OpportunityExplorerSkeleton } from "@/components/opportunities/opportunity-explorer";
import { getOpportunityRepository } from "@/lib/data";

export const metadata: Metadata = { title: "Discover" };

export default async function AppOpportunitiesPage() {
  const opportunities = await getOpportunityRepository().listPublished();

  return (
    <PageShell background="none">
      <PageContainer>
        <PageHeader
          eyebrow="Discover"
          title="Opportunities for you"
          description="Ranked by your profile when it's complete: eligibility, skill overlap, preferred categories, interests and deadline."
        />
        <Suspense fallback={<OpportunityExplorerSkeleton />}>
          <OpportunityExplorer opportunities={opportunities} detailBasePath="/app/opportunities" personalised />
        </Suspense>
      </PageContainer>
    </PageShell>
  );
}
