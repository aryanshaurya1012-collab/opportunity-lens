"use client";

import { ArrowRight, Bookmark, CalendarClock, Compass, KanbanSquare, ScanSearch, Sparkles, UserRound } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { EmptyState, Section } from "@/components/app-shell/page-header";
import { ThreeDashboardBackground } from "./three-dashboard-background";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { DeadlineText } from "@/components/shared/deadline-text";
import { ApplicationStatusBadge, OutcomeBadge } from "@/components/shared/status-badges";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { daysUntil, isDeadlinePassed } from "@/lib/domain/format";
import { APPLICATION_STATUS_LABELS } from "@/lib/domain/labels";
import { profileCompletion } from "@/lib/domain/profile";
import { APPLICATION_STATUSES, type Opportunity } from "@/lib/domain/types";
import { OUTCOME_LABELS, type EligibilityOutcome } from "@/lib/eligibility";
import { rankOpportunities } from "@/lib/matching";
import { useNow } from "@/lib/use-now";
import { useUserData } from "@/lib/user-data/use-user-data";
import { cn } from "@/lib/utils";

const QUICK_ACTIONS = [
  { href: "/app/eligibility", label: "Check eligibility", icon: ScanSearch },
  { href: "/app/opportunities", label: "Discover", icon: Compass },
  { href: "/app/applications", label: "Track applications", icon: KanbanSquare },
  { href: "/app/ai-analysis", label: "AI analysis", icon: Sparkles },
];

interface DeadlineItem {
  opportunity: Opportunity;
  deadline: string;
  source: "Saved" | "Application";
}

export function Dashboard({ opportunities }: { opportunities: Opportunity[] }) {
  const { ready, data } = useUserData();
  const { now } = useNow();
  const byId = useMemo(() => new Map(opportunities.map((opportunity) => [opportunity.id, opportunity])), [opportunities]);
  const completion = profileCompletion(data.profile);

  const ranked = useMemo(
    () => (data.profile ? rankOpportunities(data.profile, opportunities, now) : []),
    [data.profile, opportunities, now],
  );
  const recommended = ranked.filter((match) => match.eligibility.outcome !== "does_not_meet").slice(0, 4);

  const outcomeCounts = ranked.reduce<Record<EligibilityOutcome, number>>(
    (counts, match) => ({ ...counts, [match.eligibility.outcome]: counts[match.eligibility.outcome] + 1 }),
    { meets: 0, needs_review: 0, does_not_meet: 0 },
  );

  const recent = useMemo(
    () =>
      opportunities
        .filter((opportunity) => !isDeadlinePassed(opportunity, now))
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, 4),
    [opportunities, now],
  );

  const deadlines = useMemo(() => {
    const items = new Map<string, DeadlineItem>();
    for (const application of data.applications) {
      const opportunity = byId.get(application.opportunityId);
      const deadline = application.personalDeadline ?? opportunity?.deadline;
      if (opportunity && deadline && !["applied", "under_review", "interview", "accepted", "rejected"].includes(application.status)) {
        items.set(opportunity.id, { opportunity, deadline, source: "Application" });
      }
    }
    for (const saved of data.saved) {
      const opportunity = byId.get(saved.opportunityId);
      if (opportunity?.deadline && !items.has(opportunity.id)) {
        items.set(opportunity.id, { opportunity, deadline: opportunity.deadline, source: "Saved" });
      }
    }
    return [...items.values()]
      .filter((item) => daysUntil(item.deadline, now) >= 0)
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 5);
  }, [data.applications, data.saved, byId, now]);

  const savedOpportunities = data.saved
    .map((item) => byId.get(item.opportunityId))
    .filter((item): item is Opportunity => Boolean(item))
    .slice(0, 3);

  if (!ready) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
        <div className="h-36 animate-pulse rounded-lg bg-muted" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-56 animate-pulse rounded-lg bg-muted" />
          <div className="h-56 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    );
  }

  const firstName = data.profile?.fullName.split(" ")[0];

  return (
    <div className="space-y-10 relative min-h-[90vh]">
      <ThreeDashboardBackground />
      <div className="relative z-10">
        <section className="grid gap-6 rounded-lg border border-border bg-card p-6 md:grid-cols-[1fr_auto] md:items-center md:p-7">
        <div className="space-y-3">
          <p className="text-xs font-medium tracking-wide text-brand uppercase">Dashboard</p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-[1.7rem]">
            {firstName ? `Welcome back, ${firstName}` : "Welcome to OpportunityLens"}
          </h1>
          {data.profile ? (
            <div className="max-w-md space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Profile completion</span>
                <span className="font-medium tabular-nums">{completion.percent}%</span>
              </div>
              <Progress value={completion.percent} aria-label="Profile completion" />
              {completion.missing.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Add {completion.missing.slice(0, 3).join(", ").toLowerCase()} to sharpen your matches.{" "}
                  <Link href="/app/profile" className="font-medium text-brand hover:underline">
                    Update profile
                  </Link>
                </p>
              )}
            </div>
          ) : (
            <p className="max-w-lg text-sm text-muted-foreground">
              Create your profile to unlock personalised recommendations and requirement-by-requirement eligibility
              checks. It takes about three minutes.
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2 md:max-w-xs md:justify-end">
          {!data.profile && (
            <Button asChild size="lg" className="h-10 px-4">
              <Link href="/onboarding">
                <UserRound data-icon="inline-start" /> Create profile
              </Link>
            </Button>
          )}
          {QUICK_ACTIONS.map(({ href, label, icon: Icon }) => (
            <Button key={href} asChild variant="outline" size="lg" className="h-10 px-3.5">
              <Link href={href}>
                <Icon data-icon="inline-start" /> {label}
              </Link>
            </Button>
          ))}
        </div>
      </section>

      {data.profile && (
        <section aria-label="Eligibility across open opportunities" className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
          {(Object.keys(outcomeCounts) as EligibilityOutcome[]).map((outcome) => (
            <Link key={outcome} href="/app/eligibility" className="flex items-center justify-between gap-3 bg-card p-5 hover:bg-muted/40">
              <div>
                <p className="text-2xl font-semibold tabular-nums">{outcomeCounts[outcome]}</p>
                <p className="text-sm text-muted-foreground">{OUTCOME_LABELS[outcome]}</p>
              </div>
              <OutcomeBadge outcome={outcome} />
            </Link>
          ))}
        </section>
      )}

      <Section
        title="Recommended for you"
        description={data.profile ? "Ranked by eligibility, skills, preferences, interests and deadline." : undefined}
        action={
          <Link href="/app/opportunities" className="inline-flex items-center gap-1 text-sm text-brand hover:underline">
            View all <ArrowRight aria-hidden className="size-4" />
          </Link>
        }
      >
        {!data.profile ? (
          <EmptyState
            icon={<UserRound />}
            title="Recommendations need a profile"
            description="We rank opportunities using your academics, skills and preferences. Nothing is random or hardcoded."
            action={
              <Button asChild>
                <Link href="/onboarding">Create profile</Link>
              </Button>
            }
          />
        ) : recommended.length === 0 ? (
          <EmptyState
            icon={<ScanSearch />}
            title="No eligible matches right now"
            description="None of the open listings fit your profile yet. Check the eligibility page to see what's missing."
          />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {recommended.map((match) => (
              <li key={match.opportunity.id} className="flex">
                <OpportunityCard
                  opportunity={match.opportunity}
                  match={match}
                  href={`/app/opportunities/${match.opportunity.slug}`}
                  className="w-full"
                />
              </li>
            ))}
          </ul>
        )}
      </Section>

      <div className="grid gap-10 lg:grid-cols-2">
        <Section title="Upcoming deadlines" description="From your saved opportunities and active applications.">
          {deadlines.length === 0 ? (
            <EmptyState
              icon={<CalendarClock />}
              title="No upcoming deadlines"
              description="Save or track an opportunity and its deadline will appear here."
            />
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border bg-card">
              {deadlines.map((item) => (
                <li key={item.opportunity.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <Link href={`/app/opportunities/${item.opportunity.slug}`} className="block truncate text-sm font-medium hover:underline">
                      {item.opportunity.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">{item.source}</p>
                  </div>
                  <DeadlineText opportunity={{ deadline: item.deadline, isRolling: false }} className="shrink-0 text-xs" />
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section
          title="Application progress"
          action={
            <Link href="/app/applications" className="inline-flex items-center gap-1 text-sm text-brand hover:underline">
              Open tracker <ArrowRight aria-hidden className="size-4" />
            </Link>
          }
        >
          {data.applications.length === 0 ? (
            <EmptyState
              icon={<KanbanSquare />}
              title="No applications tracked"
              description="Use “Track application” on any opportunity to follow it from interested to accepted."
            />
          ) : (
            <div className="space-y-3 rounded-lg border border-border bg-card p-4">
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {APPLICATION_STATUSES.map((status) => {
                  const count = data.applications.filter((application) => application.status === status).length;
                  return (
                    <li key={status} className={cn("rounded-md border border-border p-3", count === 0 && "opacity-50")}>
                      <p className="text-lg font-semibold tabular-nums">{count}</p>
                      <p className="text-xs text-muted-foreground">{APPLICATION_STATUS_LABELS[status]}</p>
                    </li>
                  );
                })}
              </ul>
              <ul className="divide-y divide-border border-t border-border">
                {data.applications.slice(0, 3).map((application) => {
                  const opportunity = byId.get(application.opportunityId);
                  if (!opportunity) return null;
                  return (
                    <li key={application.id} className="flex items-center justify-between gap-3 pt-3 [&:not(:first-child)]:pb-0">
                      <span className="truncate text-sm">{opportunity.title}</span>
                      <ApplicationStatusBadge status={application.status} />
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </Section>
      </div>

      <Section title="Recently published" description="The newest listings across all categories.">
        <ul className="grid gap-4 md:grid-cols-2">
          {recent.map((opportunity) => (
            <li key={opportunity.id} className="flex">
              <OpportunityCard opportunity={opportunity} href={`/app/opportunities/${opportunity.slug}`} className="w-full" />
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Saved opportunities"
        action={
          data.saved.length > 0 ? (
            <Link href="/app/saved" className="inline-flex items-center gap-1 text-sm text-brand hover:underline">
              All saved ({data.saved.length}) <ArrowRight aria-hidden className="size-4" />
            </Link>
          ) : undefined
        }
      >
        {savedOpportunities.length === 0 ? (
          <EmptyState icon={<Bookmark />} title="Nothing saved yet" description="Bookmark opportunities to compare them and keep their deadlines in view." />
        ) : (
          <ul className="grid gap-4 md:grid-cols-3">
            {savedOpportunities.map((opportunity) => (
              <li key={opportunity.id} className="flex">
                <OpportunityCard opportunity={opportunity} href={`/app/opportunities/${opportunity.slug}`} className="w-full" />
              </li>
            ))}
          </ul>
        )}
      </Section>
      </div>
    </div>
  );
}
