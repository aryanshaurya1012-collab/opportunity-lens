"use client";

import { ChevronDown, KanbanSquare, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { EmptyState } from "@/components/app-shell/page-header";
import { DeadlineText } from "@/components/shared/deadline-text";
import { ApplicationStatusBadge, CategoryBadge, DemoBadge } from "@/components/shared/status-badges";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { isDeadlinePassed } from "@/lib/domain/format";
import { APPLICATION_STATUS_LABELS } from "@/lib/domain/labels";
import { APPLICATION_STATUSES, type Application, type ApplicationStatus, type Opportunity } from "@/lib/domain/types";
import { useNow } from "@/lib/use-now";
import { useUserData } from "@/lib/user-data/use-user-data";
import { cn } from "@/lib/utils";

type Filter = "all" | ApplicationStatus;

function checklistProgress(application: Application): number {
  if (application.checklist.length === 0) return 0;
  return Math.round((application.checklist.filter((item) => item.done).length / application.checklist.length) * 100);
}

function ApplicationItem({ application, opportunity }: { application: Application; opportunity: Opportunity }) {
  const { actions } = useUserData();
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(application.notes);
  const id = useId();
  const progress = checklistProgress(application);

  return (
    <li className="rounded-lg border border-border bg-card">
      <div className="grid gap-4 p-4 md:grid-cols-[1fr_11rem_10rem_auto] md:items-center">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <CategoryBadge category={opportunity.category} />
            {opportunity.isDemo && <DemoBadge />}
          </div>
          <Link href={`/app/opportunities/${opportunity.slug}`} className="block truncate font-medium hover:underline">
            {opportunity.title}
          </Link>
          <p className="truncate text-xs text-muted-foreground">{opportunity.providerName}</p>
        </div>

        <div className="space-y-1">
          <Label htmlFor={`${id}-status`} className="text-xs text-muted-foreground">
            Status
          </Label>
          <Select
            value={application.status}
            onValueChange={(value) => actions.updateApplication(application.id, { status: value as ApplicationStatus })}
          >
            <SelectTrigger id={`${id}-status`} className="h-9 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              {APPLICATION_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {APPLICATION_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor={`${id}-deadline`} className="text-xs text-muted-foreground">
            My deadline
          </Label>
          <Input
            id={`${id}-deadline`}
            type="date"
            value={application.personalDeadline?.slice(0, 10) ?? ""}
            onChange={(event) =>
              actions.updateApplication(application.id, {
                personalDeadline: event.target.value ? new Date(`${event.target.value}T18:29:00.000Z`).toISOString() : null,
              })
            }
            className="h-9"
          />
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-controls={`${id}-details`}
          className="justify-self-start md:justify-self-end"
        >
          Details <ChevronDown data-icon="inline-end" className={cn("transition-transform", expanded && "rotate-180")} />
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border px-4 py-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          Preparation
          <Progress value={progress} className="w-24" aria-label={`Preparation ${progress}% complete`} />
          <span className="tabular-nums">{progress}%</span>
        </span>
        {application.personalDeadline && (
          <DeadlineText opportunity={{ deadline: application.personalDeadline, isRolling: false }} className="text-xs" />
        )}
        <span>Updated {new Date(application.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
      </div>

      {expanded && (
        <div id={`${id}-details`} className="grid gap-6 border-t border-border p-4 md:grid-cols-2">
          <fieldset className="space-y-2.5">
            <legend className="mb-2 text-sm font-medium">Checklist</legend>
            {application.checklist.map((item) => (
              <div key={item.id} className="flex items-center gap-2.5">
                <Checkbox
                  id={`${id}-${item.id}`}
                  checked={item.done}
                  onCheckedChange={(checked) =>
                    actions.updateApplication(application.id, {
                      checklist: application.checklist.map((entry) =>
                        entry.id === item.id ? { ...entry, done: checked === true } : entry,
                      ),
                    })
                  }
                />
                <Label htmlFor={`${id}-${item.id}`} className={cn("font-normal", item.done && "text-muted-foreground line-through")}>
                  {item.label}
                </Label>
              </div>
            ))}
          </fieldset>
          <div className="space-y-2">
            <Label htmlFor={`${id}-notes`}>Notes</Label>
            <Textarea
              id={`${id}-notes`}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              onBlur={() => notes !== application.notes && actions.updateApplication(application.id, { notes })}
              rows={5}
              maxLength={2000}
              placeholder="Contacts, essay ideas, interview prep…"
            />
            <p className="text-xs text-muted-foreground">Saved when you leave the field.</p>
          </div>
          <div className="md:col-span-2">
            <Button variant="ghost" size="sm" className="text-danger" onClick={() => actions.removeApplication(application.id)}>
              <Trash2 data-icon="inline-start" /> Stop tracking
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}

function AddApplicationDialog({ opportunities, trackedIds }: { opportunities: Opportunity[]; trackedIds: Set<string> }) {
  const { actions } = useUserData();
  const { now } = useNow();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const candidates = opportunities
    .filter((opportunity) => !trackedIds.has(opportunity.id) && !isDeadlinePassed(opportunity, now))
    .filter((opportunity) => opportunity.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 8);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus data-icon="inline-start" /> Track an opportunity
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Track an opportunity</DialogTitle>
          <DialogDescription>Choose an open opportunity to add to your tracker.</DialogDescription>
        </DialogHeader>
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by title" aria-label="Search opportunities to track" />
        <ul className="max-h-80 divide-y divide-border overflow-y-auto rounded-lg border border-border">
          {candidates.length === 0 && <li className="p-4 text-sm text-muted-foreground">No matching open opportunities.</li>}
          {candidates.map((opportunity) => (
            <li key={opportunity.id}>
              <button
                type="button"
                onClick={() => {
                  actions.trackApplication({
                    opportunityId: opportunity.id,
                    category: opportunity.category,
                    personalDeadline: opportunity.deadline,
                  });
                  setOpen(false);
                  setQuery("");
                }}
                className="flex w-full items-center justify-between gap-3 p-3 text-left text-sm hover:bg-muted/60"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{opportunity.title}</span>
                  <span className="text-xs text-muted-foreground">{opportunity.providerName}</span>
                </span>
                <Plus aria-hidden className="size-4 shrink-0 text-muted-foreground" />
              </button>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

export function ApplicationTracker({ opportunities }: { opportunities: Opportunity[] }) {
  const { ready, data } = useUserData();
  const [filter, setFilter] = useState<Filter>("all");
  const byId = useMemo(() => new Map(opportunities.map((opportunity) => [opportunity.id, opportunity])), [opportunities]);
  const trackedIds = new Set(data.applications.map((application) => application.opportunityId));

  if (!ready) return <div className="h-64 animate-pulse rounded-lg bg-muted" aria-busy="true" aria-label="Loading applications" />;

  const visible = data.applications.filter((application) => filter === "all" || application.status === filter);
  const count = (status: ApplicationStatus) => data.applications.filter((application) => application.status === status).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-1.5">
          {(["all", ...APPLICATION_STATUSES] as Filter[]).map((value) => {
            const selected = filter === value;
            const total = value === "all" ? data.applications.length : count(value);
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() => setFilter(value)}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-sm transition-colors",
                  selected ? "border-brand/50 bg-brand-soft text-foreground" : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {value === "all" ? "All" : APPLICATION_STATUS_LABELS[value]}
                <span className="text-xs tabular-nums opacity-70">{total}</span>
              </button>
            );
          })}
        </div>
        <AddApplicationDialog opportunities={opportunities} trackedIds={trackedIds} />
      </div>

      {data.applications.length === 0 ? (
        <EmptyState
          icon={<KanbanSquare />}
          title="You're not tracking any applications yet"
          description="Track an opportunity to record its status, your own deadline, notes and a preparation checklist."
        />
      ) : visible.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No applications with status “{filter === "all" ? "" : APPLICATION_STATUS_LABELS[filter]}”.
        </p>
      ) : (
        <ul className="space-y-3">
          {visible.map((application) => {
            const opportunity = byId.get(application.opportunityId);
            if (!opportunity) {
              return (
                <li key={application.id} className="flex items-center justify-between rounded-lg border border-border p-4 text-sm">
                  <span className="text-muted-foreground">This listing is no longer available.</span>
                  <ApplicationStatusBadge status={application.status} />
                </li>
              );
            }
            return <ApplicationItem key={application.id} application={application} opportunity={opportunity} />;
          })}
        </ul>
      )}
    </div>
  );
}
