import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/app-shell/page-header";
import { OpportunityDetail } from "@/components/opportunities/opportunity-detail";
import { getOpportunityRepository } from "@/lib/data";

// Unknown slugs must wait for the full render so notFound() can return a real 404.
export const ensureStatic = "navigation";

export async function generateStaticParams() {
  const opportunities = await getOpportunityRepository().listPublished();
  return opportunities.map((opportunity) => ({ id: opportunity.slug }));
}

export async function generateMetadata({ params }: PageProps<"/app/opportunities/[id]">): Promise<Metadata> {
  const { id } = await params;
  const opportunity = await getOpportunityRepository().getBySlug(id);
  return { title: opportunity ? opportunity.title : "Opportunity not found" };
}

export default async function AppOpportunityPage({ params }: PageProps<"/app/opportunities/[id]">) {
  const { id } = await params;
  const opportunity = await getOpportunityRepository().getBySlug(id);
  if (!opportunity) notFound();

  return (
    <PageContainer>
      <OpportunityDetail opportunity={opportunity} backHref="/app/opportunities" backLabel="Back to discover" />
    </PageContainer>
  );
}
