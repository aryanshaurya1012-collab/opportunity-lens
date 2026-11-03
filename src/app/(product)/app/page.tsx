import type { Metadata } from "next";
import { PageContainer } from "@/components/app-shell/page-header";
import { Dashboard } from "@/components/dashboard/dashboard";
import { getOpportunityRepository } from "@/lib/data";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const opportunities = await getOpportunityRepository().listPublished();
  return (
    <PageContainer>
      <Dashboard opportunities={opportunities} />
    </PageContainer>
  );
}
