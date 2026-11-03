"use client";

import { MapPin, Wallet } from "lucide-react";
import Link from "next/link";
import { DeadlineText } from "@/components/shared/deadline-text";
import { CategoryBadge, DemoBadge, OutcomeBadge, VerificationBadge } from "@/components/shared/status-badges";
import { formatCompensation } from "@/lib/domain/format";
import { LOCATION_MODE_LABELS } from "@/lib/domain/labels";
import type { Opportunity } from "@/lib/domain/types";
import type { MatchResult } from "@/lib/matching";
import { cn } from "@/lib/utils";
import { SaveButton } from "./save-button";

export function OpportunityCard({
  opportunity,
  href,
  match,
  className,
}: {
  opportunity: Opportunity;
  href: string;
  match?: MatchResult;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group relative flex flex-col gap-4 rounded-lg border border-border bg-card p-5 transition-colors hover:border-foreground/20",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <CategoryBadge category={opportunity.category} />
          {opportunity.isDemo ? <DemoBadge /> : <VerificationBadge status={opportunity.verificationStatus} />}
        </div>
        <SaveButton opportunityId={opportunity.id} title={opportunity.title} className="-mt-1.5 -mr-2" />
      </div>

      <div className="space-y-1">
        <h3 className="leading-snug font-semibold">
          <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">
            {opportunity.title}
          </Link>
        </h3>
        <p className="text-sm text-muted-foreground">{opportunity.providerName}</p>
      </div>

      <p className="line-clamp-2 text-sm text-foreground/80">{opportunity.summary}</p>

      {match && (
        <div className="space-y-2 rounded-md bg-muted/60 p-3">
          <div className="flex items-center justify-between gap-2">
            <OutcomeBadge outcome={match.eligibility.outcome} />
            <span className="text-xs text-muted-foreground tabular-nums">Match {match.score}</span>
          </div>
          {match.reasons[0] && <p className="line-clamp-1 text-xs text-muted-foreground">{match.reasons.slice(0, 2).join(" · ")}</p>}
        </div>
      )}

      <dl className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border pt-3.5 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Deadline</dt>
          <dd>
            <DeadlineText opportunity={opportunity} />
          </dd>
        </div>
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Location</dt>
          <MapPin aria-hidden className="size-4" />
          <dd>
            {LOCATION_MODE_LABELS[opportunity.locationMode]}
            {opportunity.locations[0] && opportunity.locationMode !== "remote" ? ` · ${opportunity.locations[0]}` : ""}
          </dd>
        </div>
        <div className="flex min-w-0 items-center gap-1.5">
          <dt className="sr-only">Benefits</dt>
          <Wallet aria-hidden className="size-4 shrink-0" />
          <dd className="truncate">{formatCompensation(opportunity.compensation)}</dd>
        </div>
      </dl>
    </article>
  );
}
