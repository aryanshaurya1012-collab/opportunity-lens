import {
  Bookmark,
  Compass,
  KanbanSquare,
  LayoutDashboard,
  ScanSearch,
  Sparkles,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const APP_NAV: NavItem[] = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/opportunities", label: "Discover", icon: Compass },
  { href: "/app/eligibility", label: "Eligibility check", icon: ScanSearch },
  { href: "/app/saved", label: "Saved", icon: Bookmark },
  { href: "/app/applications", label: "Applications", icon: KanbanSquare },
  { href: "/app/ai-analysis", label: "AI analysis", icon: Sparkles },
  { href: "/app/profile", label: "Profile", icon: UserRound },
];

export function isActive(pathname: string, href: string): boolean {
  return href === "/app" ? pathname === "/app" : pathname === href || pathname.startsWith(`${href}/`);
}
