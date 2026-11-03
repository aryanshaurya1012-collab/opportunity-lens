"use client";

import { Check, ClipboardCopy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { buildOpportunitySummary, buildProfileSummary } from "@/lib/ai/context-summary";
import type { Opportunity } from "@/lib/domain/types";
import { useUserData } from "@/lib/user-data/use-user-data";

const NONE = "__none__";

export function CopyContextPanel({ opportunities }: { opportunities: Opportunity[] }) {
  const { ready, data } = useUserData();
  const [opportunitySlug, setOpportunitySlug] = useState<string>(NONE);
  const [copied, setCopied] = useState(false);

  const opportunity = opportunities.find((item) => item.slug === opportunitySlug) ?? null;
  const text = [data.profile ? buildProfileSummary(data.profile) : null, opportunity ? buildOpportunitySummary(opportunity) : null]
    .filter(Boolean)
    .join("\n\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  if (!ready) return <div className="h-48 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-4">
      {!data.profile && (
        <p className="text-sm text-muted-foreground">
          <Link href="/onboarding" className="font-medium text-brand hover:underline">
            Create a profile
          </Link>{" "}
          to include your academic background and skills.
        </p>
      )}
      <div className="space-y-2">
        <label htmlFor="context-opportunity" className="text-sm font-medium">
          Include an opportunity (optional)
        </label>
        <Select value={opportunitySlug} onValueChange={setOpportunitySlug}>
          <SelectTrigger id="context-opportunity" className="h-9 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" className="max-h-72">
            <SelectItem value={NONE}>No opportunity</SelectItem>
            {opportunities.map((item) => (
              <SelectItem key={item.slug} value={item.slug}>
                {item.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Textarea
        readOnly
        value={text || "Nothing to copy yet."}
        rows={9}
        aria-label="Text to paste into PartyRock"
        className="font-mono text-xs"
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" onClick={copy} disabled={!text}>
          {copied ? <Check data-icon="inline-start" /> : <ClipboardCopy data-icon="inline-start" />}
          {copied ? "Copied" : "Copy to clipboard"}
        </Button>
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {copied ? "Paste it into the PartyRock app yourself." : "Citizenship and date of birth are never included."}
        </p>
      </div>
    </div>
  );
}
