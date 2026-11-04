import type { Metadata } from "next";
import { PageShell } from "@/components/app-shell/page-shell";
import { PageContainer } from "@/components/app-shell/page-header";
import { Dashboard } from "@/components/dashboard/dashboard";
import { getOpportunityRepository } from "@/lib/data";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const opportunities = await getOpportunityRepository().listPublished();
  return (
    <PageShell background="space">
      <PageContainer>
        <Dashboard opportunities={opportunities} />
      </PageContainer>
    </PageShell>
  );
}
