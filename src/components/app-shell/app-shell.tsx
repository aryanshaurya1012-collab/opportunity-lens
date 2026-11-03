"use client";

import { ArrowUpRight, FlaskConical, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useUserData } from "@/lib/user-data/use-user-data";
import { cn } from "@/lib/utils";
import { APP_NAV, isActive } from "./nav-items";

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data } = useUserData();
  const counts: Record<string, number> = {
    "/app/saved": data.saved.length,
    "/app/applications": data.applications.length,
  };

  return (
    <nav aria-label="Application" className="flex flex-col gap-0.5">
      {APP_NAV.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex h-9 items-center gap-3 rounded-md px-3 text-sm transition-colors",
              active
                ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground shadow-[inset_2px_0_0_var(--brand)]"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon aria-hidden className={cn("size-4", active ? "text-brand" : "text-sidebar-foreground/55")} />
            <span className="flex-1">{label}</span>
            {counts[href] ? (
              <span className="rounded bg-secondary px-1.5 text-[11px] tabular-nums text-muted-foreground">
                {counts[href]}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

function DemoModeNote() {
  return (
    <div className="rounded-md border border-warning/25 bg-warning-soft p-3 text-xs leading-relaxed">
      <p className="flex items-center gap-1.5 font-medium text-warning">
        <FlaskConical aria-hidden className="size-3.5" /> Demo mode
      </p>
      <p className="mt-1 text-muted-foreground">
        Listings are fictional sample data. Your profile and progress are saved only in this browser.
      </p>
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <Logo href="/app" className="px-2 pt-1" />
      <SidebarNav onNavigate={onNavigate} />
      <div className="mt-auto space-y-3">
        <DemoModeNote />
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-md px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
        >
          Back to website <ArrowUpRight aria-hidden className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-svh">
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
        <SidebarContent />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur lg:hidden">
          <Logo href="/app" />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <SidebarContent onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
        </header>
        <main id="main" className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
