import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/app-shell/page-shell";
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
  if (!opportunity) return { title: "Opportunity not found" };
  return {
    title: `${opportunity.title}${opportunity.isDemo ? " (demo)" : ""}`,
    description: opportunity.summary,
  };
}

export default async function OpportunityPage({ params }: PageProps) {
  const { id } = await params;
  const opportunity = await getOpportunityRepository().getBySlug(id);
  if (!opportunity) notFound();

  return (
    <PageShell background="none">
      <div className="container-page py-10 md:py-14">
        <OpportunityDetail opportunity={opportunity} backHref="/opportunities" backLabel="All opportunities" />
      </div>
    </PageShell>
  );
}
