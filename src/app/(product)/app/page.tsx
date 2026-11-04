import type { Metadata } from "next";
import { PageShell } from "@/components/app-shell/page-shell";
import { PageContainer, PageHeader } from "@/components/app-shell/page-header";
import { Dashboard } from "@/components/dashboard/dashboard";
import { getOpportunityRepository } from "@/lib/data";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const opportunities = await getOpportunityRepository().listPublished();
  return (
    <PageShell background="space">
      <PageContainer>
        <PageHeader
          eyebrow="Dashboard"
          title="Welcome back"
          description="Your command center for discovering, tracking, and managing opportunities."
        />
        <Dashboard opportunities={opportunities} />
      </PageContainer>
    </PageShell>
  );
}
