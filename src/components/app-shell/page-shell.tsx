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
    <div className={cn("relative min-h-svh", className)}>
      {BackgroundComponent && <BackgroundComponent />}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
