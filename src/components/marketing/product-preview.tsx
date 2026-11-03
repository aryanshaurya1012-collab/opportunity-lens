import { Bookmark, Compass, KanbanSquare, LayoutDashboard, ScanSearch } from "lucide-react";
import { OutcomeSummary, RequirementEvidenceList } from "@/components/eligibility/eligibility-report";
import { LogoMark } from "@/components/shared/logo";
import { CategoryBadge, DemoBadge } from "@/components/shared/status-badges";
import type { Opportunity } from "@/lib/domain/types";
import type { EligibilityResult } from "@/lib/eligibility/types";

const RAIL = [LayoutDashboard, Compass, ScanSearch, Bookmark, KanbanSquare];

/** A live rendering of real app components against demo data, styled with the app theme. */
export function ProductPreview({
  opportunity,
  result,
}: {
  opportunity: Opportunity;
  result: EligibilityResult;
}) {
  return (
    <figure
      className="dark overflow-hidden rounded-xl border border-navy/10 bg-background text-foreground shadow-[0_30px_80px_-30px_rgb(11_27_50/0.45)]"
      aria-label="Preview of the OpportunityLens eligibility check, generated from a sample profile and demo listing"
    >
      <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="ml-3 text-[11px] text-muted-foreground">opportunitylens / eligibility</span>
      </div>
      <div className="flex">
        <div className="hidden flex-col items-center gap-4 border-r border-sidebar-border bg-sidebar px-3 py-4 sm:flex">
          <LogoMark className="size-6" />
          {RAIL.map((Icon, index) => (
            <Icon
              key={index}
              aria-hidden
              className={index === 2 ? "size-4 text-brand" : "size-4 text-sidebar-foreground/40"}
            />
          ))}
        </div>
        <div className="min-w-0 flex-1 space-y-4 p-4 sm:p-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <CategoryBadge category={opportunity.category} />
              <DemoBadge />
            </div>
            <p className="font-semibold">{opportunity.title}</p>
            <p className="text-xs text-muted-foreground">{opportunity.providerName}</p>
          </div>
          <OutcomeSummary result={result} />
          <RequirementEvidenceList result={result} limit={3} className="text-[13px]" />
        </div>
      </div>
      <figcaption className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
        Generated live by the rules engine from a fictional sample profile and demo listing.
      </figcaption>
    </figure>
  );
}
