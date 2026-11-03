"use client";

import { Bookmark } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { EmptyState } from "@/components/app-shell/page-header";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { Button } from "@/components/ui/button";
import type { Opportunity } from "@/lib/domain/types";
import { scoreOpportunity } from "@/lib/matching";
import { useNow } from "@/lib/use-now";
import { useUserData } from "@/lib/user-data/use-user-data";

export function SavedList({ opportunities }: { opportunities: Opportunity[] }) {
  const { ready, data } = useUserData();
  const { now } = useNow();
  const byId = useMemo(() => new Map(opportunities.map((opportunity) => [opportunity.id, opportunity])), [opportunities]);

  if (!ready) return <div className="h-64 animate-pulse rounded-lg bg-muted" aria-busy="true" aria-label="Loading saved opportunities" />;

  const saved = data.saved
    .map((item) => byId.get(item.opportunityId))
    .filter((item): item is Opportunity => Boolean(item));

  if (saved.length === 0) {
    return (
      <EmptyState
        icon={<Bookmark />}
        title="No saved opportunities"
        description="Use the bookmark icon on any opportunity to keep it here and see its deadline on your dashboard."
        action={
          <Button asChild>
            <Link href="/app/opportunities">Discover opportunities</Link>
          </Button>
        }
      />
    );
  }

  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {saved.map((opportunity) => (
        <li key={opportunity.id} className="flex">
          <OpportunityCard
            opportunity={opportunity}
            href={`/app/opportunities/${opportunity.slug}`}
            match={data.profile ? scoreOpportunity(data.profile, opportunity, now) : undefined}
            className="w-full"
          />
        </li>
      ))}
    </ul>
  );
}
