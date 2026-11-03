import { COMPENSATION_LABELS, GRADE_SCALE_LABELS } from "./labels";
import type { Compensation, Grade, Opportunity } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

export function daysUntil(isoDate: string, now: Date = new Date()): number {
  return Math.ceil((new Date(isoDate).getTime() - now.getTime()) / DAY_MS);
}

export function isDeadlinePassed(
  opportunity: Pick<Opportunity, "deadline">,
  now: Date = new Date(),
): boolean {
  return opportunity.deadline !== null && new Date(opportunity.deadline) < now;
}

export function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(isoDate));
}

export function formatDeadline(
  opportunity: Pick<Opportunity, "deadline" | "isRolling">,
  now: Date = new Date(),
): string {
  if (!opportunity.deadline) {
    return opportunity.isRolling ? "Rolling applications" : "Deadline not stated";
  }
  const days = daysUntil(opportunity.deadline, now);
  if (days < 0) return `Closed ${formatDate(opportunity.deadline)}`;
  if (days === 0) return "Closes today";
  if (days === 1) return "Closes tomorrow";
  if (days <= 30) return `${days} days left`;
  return `Closes ${formatDate(opportunity.deadline)}`;
}

function formatAmount(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString("en-IN")}`;
  }
}

export function formatCompensation(compensation: Compensation): string {
  const { type, amountMin, amountMax, currency = "INR", period, note } = compensation;
  if (type === "none" || type === "unspecified") {
    return note ?? COMPENSATION_LABELS[type];
  }
  const label = COMPENSATION_LABELS[type];
  if (amountMin === undefined && amountMax === undefined) {
    return note ? `${label}: ${note}` : label;
  }
  const range =
    amountMin !== undefined && amountMax !== undefined && amountMin !== amountMax
      ? `${formatAmount(amountMin, currency)}–${formatAmount(amountMax, currency)}`
      : formatAmount((amountMax ?? amountMin) as number, currency);
  const suffix = period === "month" ? "/month" : period === "year" ? "/year" : "";
  return `${label} ${range}${suffix}`;
}

export function formatGrade(grade: Grade): string {
  if (grade.scale === "percentage") return `${grade.value}%`;
  const outOf = grade.scale === "cgpa_10" ? 10 : 4;
  return `${grade.value} / ${outOf}`;
}

export function gradeScaleLabel(grade: Grade): string {
  return GRADE_SCALE_LABELS[grade.scale];
}

export function normaliseSkill(skill: string): string {
  return skill.trim().toLowerCase().replace(/\s+/g, " ");
}
