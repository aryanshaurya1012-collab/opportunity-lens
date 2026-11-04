"use client";

import { type ReactNode } from "react";
import { SpaceEarthBackground } from "@/components/dashboard/space-earth-background";
import { FluidBackground } from "@/components/dashboard/fluid-background";
import { cn } from "@/lib/utils";

type BackgroundType = "space" | "fluid" | "none";

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
    background === "space" ? SpaceEarthBackground :
    background === "fluid" ? FluidBackground :
    null;

  return (
    <div className={cn("relative min-h-svh", className)}>
      {BackgroundComponent && <BackgroundComponent />}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
