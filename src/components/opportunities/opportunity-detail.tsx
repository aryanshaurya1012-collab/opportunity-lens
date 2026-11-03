import { ArrowLeft, CircleSlash, ExternalLink, FlaskConical, ScanSearch } from "lucide-react";
import Link from "next/link";
import { DeadlineText } from "@/components/shared/deadline-text";
import { CategoryBadge, DemoBadge, Pill, VerificationBadge } from "@/components/shared/status-badges";
import { Button } from "@/components/ui/button";
import { formatCompensation, formatDate } from "@/lib/domain/format";
import { LOCATION_MODE_LABELS } from "@/lib/domain/labels";
import type { Opportunity } from "@/lib/domain/types";
import { requirementLabel } from "@/lib/eligibility";
import { SaveButton } from "./save-button";
import { TrackButton } from "./track-button";

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-3 py-2.5 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}

export function OpportunityDetail({
  opportunity,
  backHref,
  backLabel,
}: {
  opportunity: Opportunity;
  backHref: string;
  backLabel: string;
}) {
  const eligibilityHref = `/app/eligibility?opportunity=${opportunity.slug}`;

  return (
    <article className="space-y-8">
      <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft aria-hidden className="size-4" /> {backLabel}
      </Link>

      {opportunity.isDemo && (
        <div role="note" className="flex gap-3 rounded-lg border border-warning/30 bg-warning-soft p-4 text-sm">
          <FlaskConical aria-hidden className="mt-0.5 size-4 shrink-0 text-warning" />
          <p>
            <span className="font-medium text-warning">Demonstration listing.</span>{" "}
            <span className="text-foreground/80">
              The provider and details are fictional. This is not a real or currently open opportunity and has no
              application link.
            </span>
          </p>
        </div>
      )}

      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <CategoryBadge category={opportunity.category} />
          {opportunity.isDemo ? <DemoBadge /> : <VerificationBadge status={opportunity.verificationStatus} />}
        </div>
        <div className="space-y-1.5">
          <h1 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">{opportunity.title}</h1>
          <p className="text-muted-foreground">{opportunity.providerName}</p>
        </div>
        <p className="max-w-3xl text-lg text-foreground/80">{opportunity.summary}</p>
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {opportunity.applicationUrl && !opportunity.isDemo ? (
            <Button asChild size="lg" className="h-10 px-4">
              <a href={opportunity.applicationUrl} target="_blank" rel="noopener noreferrer">
                Apply on provider site <ExternalLink data-icon="inline-end" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </Button>
          ) : (
            <Button size="lg" className="h-10 px-4" disabled>
              <CircleSlash data-icon="inline-start" /> No application link (demo)
            </Button>
          )}
          <Button asChild variant="outline" size="lg" className="h-10 px-4">
            <a href={eligibilityHref}>
              <ScanSearch data-icon="inline-start" /> Check my eligibility
            </a>
          </Button>
          <SaveButton opportunityId={opportunity.id} title={opportunity.title} variant="full" />
          <TrackButton opportunity={opportunity} />
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-10">
          <section aria-labelledby="about-heading" className="space-y-3">
            <h2 id="about-heading" className="text-lg font-semibold">About this opportunity</h2>
            <p className="leading-relaxed text-foreground/85">{opportunity.description}</p>
          </section>

          {opportunity.benefits.length > 0 && (
            <section aria-labelledby="benefits-heading" className="space-y-3">
              <h2 id="benefits-heading" className="text-lg font-semibold">Benefits</h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {opportunity.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2 text-sm">
                    <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="requirements-heading" className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 id="requirements-heading" className="text-lg font-semibold">Stated eligibility requirements</h2>
              <a href={eligibilityHref} className="text-sm font-medium text-brand hover:underline">
                Compare with my profile
              </a>
            </div>
            {opportunity.requirements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No structured requirements were provided. Check the original source.</p>
            ) : (
              <ul className="divide-y divide-border rounded-lg border border-border">
                {opportunity.requirements.map((requirement) => (
                  <li key={requirement.id} className="flex flex-col gap-1.5 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                    <div className="space-y-1">
                      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        {requirementLabel(requirement)}
                      </p>
                      <p className="text-sm">{requirement.statedText}</p>
                    </div>
                    <Pill tone={requirement.mandatory ? "neutral" : "outline"}>
                      {requirement.mandatory ? "Mandatory" : "Preferred"}
                    </Pill>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {opportunity.skills.length > 0 && (
            <section aria-labelledby="skills-heading" className="space-y-3">
              <h2 id="skills-heading" className="text-lg font-semibold">Skills</h2>
              <ul className="flex flex-wrap gap-2">
                {opportunity.skills.map((skill) => (
                  <li key={skill}>
                    <Pill tone="outline">{skill}</Pill>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section aria-labelledby="facts-heading" className="rounded-lg border border-border bg-card p-5">
            <h2 id="facts-heading" className="mb-2 text-sm font-semibold">Key details</h2>
            <dl className="divide-y divide-border">
              <Fact label="Deadline">
                <DeadlineText opportunity={opportunity} showIcon={false} className="text-foreground" />
              </Fact>
              <Fact label="Benefit">{formatCompensation(opportunity.compensation)}</Fact>
              <Fact label="Mode">{LOCATION_MODE_LABELS[opportunity.locationMode]}</Fact>
              {opportunity.locations.length > 0 && <Fact label="Location">{opportunity.locations.join(", ")}</Fact>}
              {opportunity.startDate && <Fact label="Starts">{formatDate(opportunity.startDate)}</Fact>}
              {opportunity.duration && <Fact label="Duration">{opportunity.duration}</Fact>}
              <Fact label="Published">{formatDate(opportunity.publishedAt)}</Fact>
            </dl>
          </section>

          <section aria-labelledby="source-heading" className="space-y-3 rounded-lg border border-border bg-card p-5">
            <h2 id="source-heading" className="text-sm font-semibold">Source & verification</h2>
            <VerificationBadge status={opportunity.verificationStatus} />
            <dl className="divide-y divide-border">
              <Fact label="Last verified">
                {opportunity.lastVerifiedAt ? formatDate(opportunity.lastVerifiedAt) : "Never"}
              </Fact>
              <Fact label="Original source">
                {opportunity.sourceUrl ? (
                  <a
                    href={opportunity.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 break-all text-brand hover:underline"
                  >
                    View source <ExternalLink aria-hidden className="size-3.5" />
                  </a>
                ) : (
                  <span className="text-muted-foreground">
                    {opportunity.isDemo ? "None — fictional demo listing" : "Not provided"}
                  </span>
                )}
              </Fact>
            </dl>
          </section>
        </aside>
      </div>
    </article>
  );
}
