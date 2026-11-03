import { ArrowRight, Lightbulb } from "lucide-react";
import { OutcomeBadge, Pill, RequirementStatusBadge } from "@/components/shared/status-badges";
import { OUTCOME_LABELS } from "@/lib/eligibility/labels";
import type { EligibilityOutcome, EligibilityResult, Recommendation } from "@/lib/eligibility/types";
import { cn } from "@/lib/utils";

const OUTCOME_ACCENT: Record<EligibilityOutcome, string> = {
  meets: "border-success/30 bg-success-soft",
  needs_review: "border-warning/30 bg-warning-soft",
  does_not_meet: "border-danger/30 bg-danger-soft",
};

const OUTCOME_TEXT: Record<EligibilityOutcome, string> = {
  meets: "text-success",
  needs_review: "text-warning",
  does_not_meet: "text-danger",
};

export function OutcomeSummary({ result, className }: { result: EligibilityResult; className?: string }) {
  const { counts } = result;
  return (
    <div className={cn("rounded-lg border p-4", OUTCOME_ACCENT[result.outcome], className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={cn("text-sm font-semibold", OUTCOME_TEXT[result.outcome])}>{OUTCOME_LABELS[result.outcome]}</p>
        <OutcomeBadge outcome={result.outcome} className="bg-background/60" />
      </div>
      <p className="mt-1.5 text-sm text-foreground/85">{result.headline}</p>
      <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
        <div className="flex gap-1">
          <dt>Met</dt>
          <dd className="font-medium text-foreground tabular-nums">{counts.met}</dd>
        </div>
        <div className="flex gap-1">
          <dt>Not met</dt>
          <dd className="font-medium text-foreground tabular-nums">{counts.not_met}</dd>
        </div>
        <div className="flex gap-1">
          <dt>Missing info</dt>
          <dd className="font-medium text-foreground tabular-nums">{counts.unknown}</dd>
        </div>
        <div className="flex gap-1">
          <dt>Manual review</dt>
          <dd className="font-medium text-foreground tabular-nums">{counts.manual_review}</dd>
        </div>
      </dl>
    </div>
  );
}

export function RequirementEvidenceList({
  result,
  limit,
  className,
}: {
  result: EligibilityResult;
  limit?: number;
  className?: string;
}) {
  const rows = limit ? result.results.slice(0, limit) : result.results;
  return (
    <ol className={cn("divide-y divide-border rounded-lg border border-border", className)}>
      {rows.map((row) => (
        <li key={row.requirementId} className="grid gap-2 p-4 sm:grid-cols-[1fr_auto] sm:items-start">
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium">{row.label}</p>
              {!row.mandatory && <Pill tone="outline">Preferred</Pill>}
            </div>
            <blockquote className="border-l-2 border-border pl-3 text-sm text-muted-foreground italic">
              “{row.statedText}”
            </blockquote>
            <p className="text-sm text-foreground/85">{row.explanation}</p>
            {row.profileValue && (
              <p className="text-xs text-muted-foreground">
                Your profile: <span className="text-foreground/85">{row.profileValue}</span>
              </p>
            )}
          </div>
          <div className="sm:pt-0.5">
            <RequirementStatusBadge status={row.status} />
          </div>
        </li>
      ))}
    </ol>
  );
}

const PRIORITY_LABEL: Record<Recommendation["priority"], string> = {
  high: "High impact",
  medium: "Worth doing",
  low: "Good to know",
};

export function RecommendationList({
  recommendations,
  renderAction,
}: {
  recommendations: Recommendation[];
  renderAction?: (recommendation: Recommendation) => React.ReactNode;
}) {
  if (recommendations.length === 0) {
    return (
      <p className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
        No further actions. Review the original listing and prepare your application materials.
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {recommendations.map((recommendation) => (
        <li key={recommendation.requirementId} className="flex gap-3 rounded-lg border border-border p-3.5">
          <Lightbulb aria-hidden className="mt-0.5 size-4 shrink-0 text-brand" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="text-sm">{recommendation.text}</p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">{PRIORITY_LABEL[recommendation.priority]}</span>
              {renderAction?.(recommendation)}
            </div>
          </div>
          {!renderAction && recommendation.action && (
            <ArrowRight aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          )}
        </li>
      ))}
    </ul>
  );
}
