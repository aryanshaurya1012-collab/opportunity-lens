"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUserData } from "@/lib/user-data/use-user-data";

export function ResetDemoData() {
  const { actions } = useUserData();
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-sm font-semibold">Reset demo data</h2>
        <p className="text-sm text-muted-foreground">
          Clears your profile, saved opportunities, applications and assessment history from this browser.
        </p>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="destructive">
            <RotateCcw data-icon="inline-start" /> Reset
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset all demo data?</DialogTitle>
            <DialogDescription>
              This permanently removes everything OpportunityLens has stored in this browser. It can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button variant="destructive" onClick={() => actions.resetAll()}>
                Reset everything
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
