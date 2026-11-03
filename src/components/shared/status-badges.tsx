import { BadgeCheck, CircleAlert, CircleCheck, CircleHelp, CircleX, FlaskConical, ShieldQuestion } from "lucide-react";
import type { ReactNode } from "react";
import { APPLICATION_STATUS_LABELS, CATEGORY_LABELS, VERIFICATION_LABELS } from "@/lib/domain/labels";
import type { ApplicationStatus, OpportunityCategory, VerificationStatus } from "@/lib/domain/types";
import { OUTCOME_SHORT_LABELS, REQUIREMENT_STATUS_LABELS } from "@/lib/eligibility/labels";
import type { EligibilityOutcome, RequirementStatus } from "@/lib/eligibility/types";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "brand" | "success" | "warning" | "danger" | "outline";

const TONES: Record<Tone, string> = {
  neutral: "bg-secondary text-secondary-foreground",
  brand: "bg-brand-soft text-brand",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  outline: "border border-border text-muted-foreground",
};

export function Pill({
  tone = "neutral",
  icon,
  className,
  children,
  title,
}: {
  tone?: Tone;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1 rounded-md px-2 text-xs font-medium whitespace-nowrap [&>svg]:size-3.5",
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <Pill
      tone="warning"
      icon={<FlaskConical aria-hidden />}
      className={className}
      title="Fictional demonstration listing. Not a real or currently open opportunity."
    >
      Demo data
    </Pill>
  );
}

export function VerificationBadge({ status, className }: { status: VerificationStatus; className?: string }) {
  const verified = status === "verified";
  return (
    <Pill
      tone={verified ? "success" : "outline"}
      icon={verified ? <BadgeCheck aria-hidden /> : <ShieldQuestion aria-hidden />}
      className={className}
    >
      {VERIFICATION_LABELS[status]}
    </Pill>
  );
}

export function CategoryBadge({ category, className }: { category: OpportunityCategory; className?: string }) {
  return (
    <Pill tone="brand" className={className}>
      {CATEGORY_LABELS[category]}
    </Pill>
  );
}

const OUTCOME_TONE: Record<EligibilityOutcome, Tone> = {
  meets: "success",
  needs_review: "warning",
  does_not_meet: "danger",
};

const OUTCOME_ICON: Record<EligibilityOutcome, ReactNode> = {
  meets: <CircleCheck aria-hidden />,
  needs_review: <CircleAlert aria-hidden />,
  does_not_meet: <CircleX aria-hidden />,
};

export function OutcomeBadge({ outcome, className }: { outcome: EligibilityOutcome; className?: string }) {
  return (
    <Pill tone={OUTCOME_TONE[outcome]} icon={OUTCOME_ICON[outcome]} className={className}>
      {OUTCOME_SHORT_LABELS[outcome]}
    </Pill>
  );
}

const REQUIREMENT_TONE: Record<RequirementStatus, Tone> = {
  met: "success",
  not_met: "danger",
  unknown: "warning",
  manual_review: "neutral",
};

const REQUIREMENT_ICON: Record<RequirementStatus, ReactNode> = {
  met: <CircleCheck aria-hidden />,
  not_met: <CircleX aria-hidden />,
  unknown: <CircleHelp aria-hidden />,
  manual_review: <CircleAlert aria-hidden />,
};

export function RequirementStatusBadge({ status }: { status: RequirementStatus }) {
  return (
    <Pill tone={REQUIREMENT_TONE[status]} icon={REQUIREMENT_ICON[status]}>
      {REQUIREMENT_STATUS_LABELS[status]}
    </Pill>
  );
}

const APPLICATION_TONE: Record<ApplicationStatus, Tone> = {
  interested: "neutral",
  preparing: "brand",
  applied: "brand",
  under_review: "warning",
  interview: "warning",
  accepted: "success",
  rejected: "danger",
};

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  return <Pill tone={APPLICATION_TONE[status]}>{APPLICATION_STATUS_LABELS[status]}</Pill>;
}
