"use client";

import { KanbanSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApplicationStatusBadge } from "@/components/shared/status-badges";
import type { Opportunity } from "@/lib/domain/types";
import { useUserData } from "@/lib/user-data/use-user-data";

export function TrackButton({ opportunity }: { opportunity: Pick<Opportunity, "id" | "category" | "deadline"> }) {
  const { ready, data, actions } = useUserData();
  const application = data.applications.find((item) => item.opportunityId === opportunity.id);

  if (application) {
    return (
      <a
        href="/app/applications"
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm hover:bg-muted"
      >
        <KanbanSquare aria-hidden className="size-4" /> Tracking <ApplicationStatusBadge status={application.status} />
      </a>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="h-10 px-4"
      disabled={!ready}
      onClick={() =>
        actions.trackApplication({
          opportunityId: opportunity.id,
          category: opportunity.category,
          personalDeadline: opportunity.deadline,
        })
      }
    >
      <KanbanSquare data-icon="inline-start" /> Track application
    </Button>
  );
}
