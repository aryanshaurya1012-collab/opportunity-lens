import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-end md:justify-between rounded-2xl border border-border/60 bg-card/60 p-6 md:p-7 backdrop-blur-sm shadow-xs",
        className,
      )}
    >
      <div className="min-w-0 space-y-1.5">
        {eyebrow && (
          <p className="text-xs font-semibold tracking-wider text-brand uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground">
          {title}
        </h1>
        {description && (
          <div className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </div>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}

export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-6xl space-y-8 px-4 py-8 md:px-8 md:py-10", className)}>{children}</div>;
}

export function Section({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-4", className)} aria-labelledby={`section-${title.replace(/\W+/g, "-").toLowerCase()}`}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 id={`section-${title.replace(/\W+/g, "-").toLowerCase()}`} className="text-base font-semibold text-foreground">
            {title}
          </h2>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border p-8 md:p-12 text-center bg-card/40">
      {icon && <div className="text-muted-foreground [&>svg]:size-7">{icon}</div>}
      <div className="space-y-1">
        <p className="font-semibold text-foreground text-sm">{title}</p>
        <p className="mx-auto max-w-md text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
      {action}
    </div>
  );
}
