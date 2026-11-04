import type { Metadata } from "next";
import { PageShell } from "@/components/app-shell/page-shell";
import { PageContainer, PageHeader } from "@/components/app-shell/page-header";
import { ApplicationTracker } from "@/components/applications/application-tracker";
import { getOpportunityRepository } from "@/lib/data";

export const metadata: Metadata = { title: "Applications" };

export default async function ApplicationsPage() {
  const opportunities = await getOpportunityRepository().listPublished();
  return (
    <PageShell background="none">
      <PageContainer>
        <PageHeader
          eyebrow="Applications"
          title="Application tracker"
          description="Follow every application from interested to accepted, with your own deadlines, notes and a preparation checklist."
        />
        <ApplicationTracker opportunities={opportunities} />
      </PageContainer>
    </PageShell>
  );
}
