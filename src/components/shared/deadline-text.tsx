"use client";

import { CalendarClock } from "lucide-react";
import { daysUntil, formatDate, formatDeadline } from "@/lib/domain/format";
import type { Opportunity } from "@/lib/domain/types";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/utils";

export function DeadlineText({
  opportunity,
  className,
  showIcon = true,
}: {
  opportunity: Pick<Opportunity, "deadline" | "isRolling">;
  className?: string;
  showIcon?: boolean;
}) {
  const { now, isClient } = useNow();
  const days = opportunity.deadline ? daysUntil(opportunity.deadline, now) : null;
  const urgent = isClient && days !== null && days >= 0 && days <= 7;
  const closed = isClient && days !== null && days < 0;
  const label =
    isClient || !opportunity.deadline
      ? formatDeadline(opportunity, now)
      : `Closes ${formatDate(opportunity.deadline)}`;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-sm",
        urgent ? "font-medium text-warning" : closed ? "text-danger" : "text-muted-foreground",
        className,
      )}
    >
      {showIcon && <CalendarClock aria-hidden className="size-4 shrink-0" />}
      <time dateTime={opportunity.deadline ?? undefined}>{label}</time>
    </span>
  );
}
