import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OpportunityDetail } from "@/components/opportunities/opportunity-detail";
import { getOpportunityRepository } from "@/lib/data";

// Unknown slugs must wait for the full render so notFound() can return a real 404.
export const ensureStatic = "navigation";

export async function generateStaticParams() {
  const opportunities = await getOpportunityRepository().listPublished();
  return opportunities.map((opportunity) => ({ id: opportunity.slug }));
}

export async function generateMetadata({ params }: PageProps<"/opportunities/[id]">): Promise<Metadata> {
  const { id } = await params;
  const opportunity = await getOpportunityRepository().getBySlug(id);
  if (!opportunity) return { title: "Opportunity not found" };
  return {
    title: `${opportunity.title}${opportunity.isDemo ? " (demo)" : ""}`,
    description: opportunity.summary,
  };
}

export default async function OpportunityPage({ params }: PageProps<"/opportunities/[id]">) {
  const { id } = await params;
  const opportunity = await getOpportunityRepository().getBySlug(id);
  if (!opportunity) notFound();

  return (
    <div className="container-page py-10 md:py-14">
      <OpportunityDetail opportunity={opportunity} backHref="/opportunities" backLabel="All opportunities" />
    </div>
  );
}
