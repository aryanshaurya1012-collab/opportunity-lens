import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer, PageHeader } from "@/components/app-shell/page-header";
import { EligibilityWorkbench, EligibilityWorkbenchSkeleton } from "@/components/eligibility/eligibility-workbench";
import { getOpportunityRepository } from "@/lib/data";

export const metadata: Metadata = { title: "Eligibility check" };

export default async function EligibilityPage() {
  const opportunities = await getOpportunityRepository().listPublished();

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Eligibility intelligence"
        title="Check your eligibility"
        description="Your profile is compared with each stated requirement. Missing information is never treated as a pass, and conditions that need human judgement are flagged for manual review."
      />
      <Suspense fallback={<EligibilityWorkbenchSkeleton />}>
        <EligibilityWorkbench opportunities={opportunities} />
      </Suspense>
    </PageContainer>
  );
}
