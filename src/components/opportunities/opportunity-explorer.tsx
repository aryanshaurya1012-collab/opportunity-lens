"use client";

import { SearchX, SlidersHorizontal, Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { Opportunity } from "@/lib/domain/types";
import {
  DEFAULT_FILTERS,
  filterOpportunities,
  filtersToSearchParams,
  parseFilters,
  rankOpportunities,
  type MatchResult,
  type OpportunityFilters,
  type SortOption,
} from "@/lib/matching";
import { useNow } from "@/lib/use-now";
import { useUserData } from "@/lib/user-data/use-user-data";
import { cn } from "@/lib/utils";
import { FilterPanel } from "./filter-panel";
import { OpportunityCard } from "./opportunity-card";

function activeFilterCount(filters: OpportunityFilters): number {
  return (
    filters.categories.length +
    filters.locationModes.length +
    (filters.deadlineWithin !== "any" ? 1 : 0) +
    (filters.paidOnly ? 1 : 0) +
    (filters.includeClosed ? 1 : 0)
  );
}

export function OpportunityExplorer({
  opportunities,
  detailBasePath,
  personalised = false,
}: {
  opportunities: Opportunity[];
  detailBasePath: string;
  personalised?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { now } = useNow();
  const { data } = useUserData();
  const [isPending, startTransition] = useTransition();

  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const [query, setQuery] = useState(filters.query);

  const update = (next: OpportunityFilters) => {
    const params = filtersToSearchParams(next).toString();
    startTransition(() => {
      router.replace(params ? `${pathname}?${params}` : pathname, { scroll: false });
    });
  };

  useEffect(() => {
    if (query === filters.query) return;
    const timer = window.setTimeout(() => update({ ...filters, query }), 250);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounce only on query edits
  }, [query]);

  const profile = personalised ? data.profile : null;
  const matches = useMemo(() => {
    if (!profile) return new Map<string, MatchResult>();
    return new Map(rankOpportunities(profile, opportunities, now).map((match) => [match.opportunity.id, match]));
  }, [profile, opportunities, now]);

  const results = useMemo(() => {
    const filtered = filterOpportunities(opportunities, filters, now);
    if (profile && filters.sort === "relevance" && !filters.query) {
      return [...filtered].sort((a, b) => (matches.get(b.id)?.score ?? -1) - (matches.get(a.id)?.score ?? -1));
    }
    return filtered;
  }, [opportunities, filters, now, profile, matches]);

  const activeCount = activeFilterCount(filters);
  const hasAnyFilter = activeCount > 0 || filters.query !== "";

  const clearAll = () => {
    setQuery("");
    update(DEFAULT_FILTERS);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[15rem_1fr]">
      <aside aria-label="Filters" className="hidden lg:block">
        <div className="sticky top-24">
          <FilterPanel filters={filters} onChange={update} idPrefix="desktop" />
        </div>
      </aside>

      <div className="min-w-0 space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title, provider, skill or keyword"
              aria-label="Search opportunities"
              className="h-10 bg-card pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="lg" className="h-10 lg:hidden">
                  <SlidersHorizontal data-icon="inline-start" />
                  Filters{activeCount ? ` (${activeCount})` : ""}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="px-4 pb-6">
                  <FilterPanel filters={filters} onChange={update} idPrefix="mobile" />
                </div>
              </SheetContent>
            </Sheet>
            <Select value={filters.sort} onValueChange={(value) => update({ ...filters, sort: value as SortOption })}>
              <SelectTrigger className="h-10! min-w-40 bg-card" aria-label="Sort by">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="relevance">{profile ? "Best match" : "Relevance"}</SelectItem>
                <SelectItem value="deadline">Deadline (soonest)</SelectItem>
                <SelectItem value="recent">Recently published</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
          <p aria-live="polite">
            {results.length} {results.length === 1 ? "opportunity" : "opportunities"}
            {isPending && <span className="ml-2 text-xs">Updating…</span>}
          </p>
          {hasAnyFilter && (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              <X data-icon="inline-start" /> Clear filters
            </Button>
          )}
        </div>

        {results.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border px-6 py-14 text-center">
            <SearchX aria-hidden className="size-6 text-muted-foreground" />
            <p className="font-medium">No opportunities match these filters</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Try removing a filter, widening the deadline window or searching for a broader skill.
            </p>
            <Button variant="outline" onClick={clearAll}>
              Clear filters
            </Button>
          </div>
        ) : (
          <ul className={cn("grid gap-4 md:grid-cols-2", isPending && "opacity-70 transition-opacity")}>
            {results.map((opportunity) => (
              <li key={opportunity.id} className="flex">
                <OpportunityCard
                  opportunity={opportunity}
                  href={`${detailBasePath}/${opportunity.slug}`}
                  match={matches.get(opportunity.id)}
                  className="w-full"
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function OpportunityExplorerSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[15rem_1fr]" aria-busy="true" aria-label="Loading opportunities">
      <div className="hidden space-y-3 lg:block">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="h-5 animate-pulse rounded bg-muted" />
        ))}
      </div>
      <div className="space-y-5">
        <div className="h-10 animate-pulse rounded-lg bg-muted" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="h-60 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}
