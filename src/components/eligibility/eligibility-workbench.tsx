"use client";

import { ArrowRight, ExternalLink, Sparkles, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { OutcomeSummary, RecommendationList, RequirementEvidenceList } from "@/components/eligibility/eligibility-report";
import { SaveButton } from "@/components/opportunities/save-button";
import { TrackButton } from "@/components/opportunities/track-button";
import { DeadlineText } from "@/components/shared/deadline-text";
import { CategoryBadge, DemoBadge, OutcomeBadge } from "@/components/shared/status-badges";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isDeadlinePassed } from "@/lib/domain/format";
import { CATEGORY_PLURAL_LABELS } from "@/lib/domain/labels";
import { emptyProfile, profileCompletion } from "@/lib/domain/profile";
import { OPPORTUNITY_CATEGORIES, type Opportunity } from "@/lib/domain/types";
import { evaluateEligibility, PROFILE_FIELD_LABELS, type EligibilityOutcome } from "@/lib/eligibility";
import { useNow } from "@/lib/use-now";
import { useUserData } from "@/lib/user-data/use-user-data";

const OUTCOME_ORDER: Record<EligibilityOutcome, number> = { meets: 0, needs_review: 1, does_not_meet: 2 };

export function EligibilityWorkbench({ opportunities }: { opportunities: Opportunity[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { now } = useNow();
  const { ready, data, actions } = useUserData();

  const selectedSlug = searchParams.get("opportunity");
  const selected = opportunities.find((opportunity) => opportunity.slug === selectedSlug) ?? null;
  const profile = useMemo(() => data.profile ?? { ...emptyProfile(), updatedAt: "" }, [data.profile]);
  const completion = profileCompletion(data.profile);

  const open = useMemo(
    () => opportunities.filter((opportunity) => !isDeadlinePassed(opportunity, now)),
    [opportunities, now],
  );

  const result = useMemo(() => (selected ? evaluateEligibility(profile, selected, now) : null), [selected, profile, now]);

  const overview = useMemo(
    () =>
      open
        .map((opportunity) => ({ opportunity, result: evaluateEligibility(profile, opportunity, now) }))
        .sort(
          (a, b) =>
            OUTCOME_ORDER[a.result.outcome] - OUTCOME_ORDER[b.result.outcome] ||
            a.result.missingFields.length - b.result.missingFields.length,
        ),
    [open, profile, now],
  );

  const latestForSelected = selected
    ? data.assessments.find((assessment) => assessment.opportunityId === selected.id)
    : undefined;

  useEffect(() => {
    if (!ready || !selected || !result || !data.profile) return;
    const isFresh =
      latestForSelected &&
      latestForSelected.outcome === result.outcome &&
      latestForSelected.evaluatedAt >= data.profile.updatedAt;
    if (isFresh) return;
    actions.recordAssessment({
      opportunityId: selected.id,
      outcome: result.outcome,
      counts: result.counts,
      missingFields: result.missingFields,
      engine: result.engine,
      evaluatedAt: new Date().toISOString(),
    });
  }, [ready, selected, result, data.profile, latestForSelected, actions]);

  const select = (slug: string) => {
    router.replace(`${pathname}?opportunity=${slug}`, { scroll: false });
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-2">
          <label htmlFor="opportunity-picker" className="text-sm font-medium">
            Opportunity to evaluate
          </label>
          <Select value={selected?.slug} onValueChange={select}>
            <SelectTrigger id="opportunity-picker" className="h-11! w-full bg-card">
              <SelectValue placeholder="Choose an opportunity…" />
            </SelectTrigger>
            <SelectContent position="popper" className="max-h-96">
              {OPPORTUNITY_CATEGORIES.map((category) => {
                const items = opportunities.filter((opportunity) => opportunity.category === category);
                if (!items.length) return null;
                return (
                  <SelectGroup key={category}>
                    <SelectLabel>{CATEGORY_PLURAL_LABELS[category]}</SelectLabel>
                    {items.map((opportunity) => (
                      <SelectItem key={opportunity.slug} value={opportunity.slug}>
                        {opportunity.title}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3.5">
          <UserRound aria-hidden className="size-5 shrink-0 text-brand" />
          <div className="min-w-0 flex-1 text-sm">
            <p className="truncate font-medium">{ready ? data.profile?.fullName || "No profile yet" : "Loading profile…"}</p>
            <p className="text-xs text-muted-foreground">Profile {completion.percent}% complete</p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href={data.profile ? "/app/profile" : "/onboarding"}>{data.profile ? "Edit" : "Create"}</Link>
          </Button>
        </div>
      </div>

      {ready && !data.profile && (
        <div role="note" className="flex flex-col gap-3 rounded-lg border border-warning/30 bg-warning-soft p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-medium text-warning">You haven&apos;t created a profile yet.</span>{" "}
            <span className="text-foreground/80">Requirements will show as missing information until you add your details.</span>
          </p>
          <Button asChild size="sm">
            <a href="/onboarding">Create profile</a>
          </Button>
        </div>
      )}

      {!ready ? (
        <div className="h-96 animate-pulse rounded-lg bg-muted" aria-busy="true" aria-label="Loading your eligibility results" />
      ) : selected && result ? (
        <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
          <div className="min-w-0 space-y-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <CategoryBadge category={selected.category} />
                {selected.isDemo && <DemoBadge />}
              </div>
              <h2 className="text-xl font-semibold">{selected.title}</h2>
              <p className="text-sm text-muted-foreground">{selected.providerName}</p>
            </div>
            <OutcomeSummary result={result} />
            <section aria-labelledby="evidence-heading" className="space-y-3">
              <h3 id="evidence-heading" className="font-semibold">Requirement-by-requirement evidence</h3>
              <RequirementEvidenceList result={result} />
            </section>
          </div>
          <aside className="space-y-6">
            <section aria-labelledby="next-heading" className="space-y-3">
              <h3 id="next-heading" className="font-semibold">What to do next</h3>
              <RecommendationList
                recommendations={result.recommendations}
                renderAction={(recommendation) =>
                  recommendation.action ? (
                    <Link href="/app/profile" className="text-xs font-medium text-brand hover:underline">
                      Update {PROFILE_FIELD_LABELS[recommendation.action.field].toLowerCase()}
                    </Link>
                  ) : null
                }
              />
            </section>
            {result.missingFields.length > 0 && (
              <section aria-labelledby="missing-heading" className="space-y-2 rounded-lg border border-border p-4">
                <h3 id="missing-heading" className="text-sm font-semibold">Missing from your profile</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {result.missingFields.map((field) => (
                    <li key={field}>{PROFILE_FIELD_LABELS[field]}</li>
                  ))}
                </ul>
              </section>
            )}
            <div className="flex flex-wrap gap-2">
              <SaveButton opportunityId={selected.id} title={selected.title} variant="full" />
              <TrackButton opportunity={selected} />
            </div>
            <div className="space-y-2 border-t border-border pt-4 text-sm">
              <Link href={`/app/opportunities/${selected.slug}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                <ExternalLink aria-hidden className="size-4" /> View full listing
              </Link>
              <Link href="/app/ai-analysis" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                <Sparkles aria-hidden className="size-4" /> Deeper analysis with PartyRock AI
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              Evaluated by the OpportunityLens rules engine against the provider&apos;s stated requirements. Always
              confirm details on the original listing before applying.
            </p>
          </aside>
        </div>
      ) : (
        <section aria-labelledby="overview-heading" className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 id="overview-heading" className="font-semibold">
                Your eligibility across {open.length} open opportunities
              </h2>
              <p className="text-sm text-muted-foreground">Pick one to see the evidence behind its result.</p>
            </div>
          </div>
          <ul className="divide-y divide-border rounded-lg border border-border bg-card">
            {overview.map(({ opportunity, result: rowResult }) => (
              <li key={opportunity.id}>
                <button
                  type="button"
                  onClick={() => select(opportunity.slug)}
                  className="grid w-full gap-2 p-4 text-left transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-6"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{opportunity.title}</span>
                    <span className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                      {opportunity.providerName}
                      <DeadlineText opportunity={opportunity} showIcon={false} className="text-xs" />
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {rowResult.counts.met}/{rowResult.results.length} met
                    {rowResult.missingFields.length ? ` · ${rowResult.missingFields.length} missing` : ""}
                  </span>
                  <span className="flex items-center gap-2">
                    <OutcomeBadge outcome={rowResult.outcome} />
                    <ArrowRight aria-hidden className="size-4 text-muted-foreground" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export function EligibilityWorkbenchSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading eligibility check">
      <div className="h-11 animate-pulse rounded-lg bg-muted" />
      <div className="h-72 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}