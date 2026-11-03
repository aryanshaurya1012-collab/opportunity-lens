"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserData } from "@/lib/user-data/use-user-data";
import { cn } from "@/lib/utils";

export function SaveButton({
  opportunityId,
  title,
  variant = "icon",
  className,
}: {
  opportunityId: string;
  title: string;
  variant?: "icon" | "full";
  className?: string;
}) {
  const { ready, data, actions } = useUserData();
  const saved = data.saved.some((item) => item.opportunityId === opportunityId);
  const label = saved ? `Remove ${title} from saved` : `Save ${title}`;
  const Icon = saved ? BookmarkCheck : Bookmark;

  if (variant === "full") {
    return (
      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled={!ready}
        aria-pressed={saved}
        onClick={() => actions.toggleSaved(opportunityId)}
        className={cn("h-10 px-4", className)}
      >
        <Icon data-icon="inline-start" className={cn(saved && "text-brand")} />
        {saved ? "Saved" : "Save"}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={!ready}
      aria-pressed={saved}
      aria-label={label}
      title={label}
      onClick={() => actions.toggleSaved(opportunityId)}
      className={cn("relative z-10", saved ? "text-brand" : "text-muted-foreground", className)}
    >
      <Icon />
    </Button>
  );
}
