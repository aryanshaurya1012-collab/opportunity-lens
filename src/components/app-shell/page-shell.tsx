"use client";

import { type ReactNode } from "react";
import { SpaceEarthBackground } from "@/components/dashboard/space-earth-background";
import { FluidBackground } from "@/components/dashboard/fluid-background";
import { ThreeDashboardBackground } from "@/components/dashboard/three-dashboard-background";
import { cn } from "@/lib/utils";

export type BackgroundType = "space" | "fluid" | "network" | "none";

interface PageShellProps {
  children: ReactNode;
  background?: BackgroundType;
  className?: string;
}

export function PageShell({
  children,
  background = "space",
  className,
}: PageShellProps) {
  const BackgroundComponent =
    background === "space"
      ? SpaceEarthBackground
      : background === "fluid"
        ? FluidBackground
        : background === "network"
          ? ThreeDashboardBackground
          : null;

  return (
    <div className={cn("relative min-h-svh w-full", className)}>
      {BackgroundComponent && (
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden select-none z-0"
          aria-hidden="true"
        >
          <div className="sticky top-0 h-svh w-full overflow-hidden">
            <BackgroundComponent />
          </div>
        </div>
      )}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
