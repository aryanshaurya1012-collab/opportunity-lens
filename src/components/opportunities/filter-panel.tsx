"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { CATEGORY_PLURAL_LABELS, LOCATION_MODE_LABELS } from "@/lib/domain/labels";
import { LOCATION_MODES, OPPORTUNITY_CATEGORIES } from "@/lib/domain/types";
import type { OpportunityFilters } from "@/lib/matching";
import { DEADLINE_WINDOWS, type DeadlineWindow } from "@/lib/matching/filters";

const DEADLINE_LABELS: Record<DeadlineWindow, string> = {
  any: "Any time",
  "7": "Next 7 days",
  "30": "Next 30 days",
  "90": "Next 90 days",
};

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export function FilterPanel({
  filters,
  onChange,
  idPrefix,
}: {
  filters: OpportunityFilters;
  onChange: (next: OpportunityFilters) => void;
  idPrefix: string;
}) {
  return (
    <div className="space-y-7">
      <fieldset className="space-y-3">
        <legend className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">Category</legend>
        {OPPORTUNITY_CATEGORIES.map((category) => {
          const id = `${idPrefix}-cat-${category}`;
          return (
            <div key={category} className="flex items-center gap-2.5">
              <Checkbox
                id={id}
                checked={filters.categories.includes(category)}
                onCheckedChange={() => onChange({ ...filters, categories: toggle(filters.categories, category) })}
              />
              <Label htmlFor={id} className="font-normal">
                {CATEGORY_PLURAL_LABELS[category]}
              </Label>
            </div>
          );
        })}
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">Work mode</legend>
        {LOCATION_MODES.map((mode) => {
          const id = `${idPrefix}-mode-${mode}`;
          return (
            <div key={mode} className="flex items-center gap-2.5">
              <Checkbox
                id={id}
                checked={filters.locationModes.includes(mode)}
                onCheckedChange={() => onChange({ ...filters, locationModes: toggle(filters.locationModes, mode) })}
              />
              <Label htmlFor={id} className="font-normal">
                {LOCATION_MODE_LABELS[mode]}
              </Label>
            </div>
          );
        })}
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">Deadline</legend>
        <RadioGroup
          value={filters.deadlineWithin}
          onValueChange={(value) => onChange({ ...filters, deadlineWithin: value as DeadlineWindow })}
          className="gap-3"
        >
          {DEADLINE_WINDOWS.map((window) => {
            const id = `${idPrefix}-deadline-${window}`;
            return (
              <div key={window} className="flex items-center gap-2.5">
                <RadioGroupItem id={id} value={window} />
                <Label htmlFor={id} className="font-normal">
                  {DEADLINE_LABELS[window]}
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      </fieldset>

      <div className="space-y-4 border-t border-border pt-6">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor={`${idPrefix}-paid`} className="font-normal">
            Paid or funded only
          </Label>
          <Switch
            id={`${idPrefix}-paid`}
            checked={filters.paidOnly}
            onCheckedChange={(checked) => onChange({ ...filters, paidOnly: checked })}
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor={`${idPrefix}-closed`} className="font-normal">
            Include closed listings
          </Label>
          <Switch
            id={`${idPrefix}-closed`}
            checked={filters.includeClosed}
            onCheckedChange={(checked) => onChange({ ...filters, includeClosed: checked })}
          />
        </div>
      </div>
    </div>
  );
}
