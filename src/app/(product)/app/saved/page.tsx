import type { Metadata } from "next";
import { PageShell } from "@/components/app-shell/page-shell";
import { PageContainer, PageHeader } from "@/components/app-shell/page-header";
import { SavedList } from "@/components/saved/saved-list";
import { getOpportunityRepository } from "@/lib/data";

export const metadata: Metadata = { title: "Saved" };

export default async function SavedPage() {
  const opportunities = await getOpportunityRepository().listPublished();
  return (
    <PageShell background="space">
      <PageContainer>
        <PageHeader eyebrow="Saved" title="Saved opportunities" description="Opportunities you've bookmarked, with your current eligibility for each." />
        <SavedList opportunities={opportunities} />
      </PageContainer>
    </PageShell>
  );
}
