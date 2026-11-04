import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/app-shell/page-shell";
import { PageContainer } from "@/components/app-shell/page-header";
import { OpportunityDetail } from "@/components/opportunities/opportunity-detail";
import { getOpportunityRepository } from "@/lib/data";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const opportunities = await getOpportunityRepository().listPublished();
  return opportunities.map((opportunity) => ({ id: opportunity.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const opportunity = await getOpportunityRepository().getBySlug(id);
  return { title: opportunity ? opportunity.title : "Opportunity not found" };
}

export default async function AppOpportunityPage({ params }: PageProps) {
  const { id } = await params;
  const opportunity = await getOpportunityRepository().getBySlug(id);
  if (!opportunity) notFound();

  return (
    <PageShell background="space">
      <PageContainer>
        <OpportunityDetail opportunity={opportunity} backHref="/app/opportunities" backLabel="Back to discover" />
      </PageContainer>
    </PageShell>
  );
}
