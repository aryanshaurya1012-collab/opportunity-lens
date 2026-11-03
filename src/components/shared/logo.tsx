import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-7", className)}>
      <rect width="32" height="32" rx="7" className="fill-navy dark:fill-brand/15" />
      <circle cx="14.5" cy="14.5" r="7" fill="none" strokeWidth="2.6" className="stroke-white dark:stroke-brand" />
      <path d="M19.6 19.6 25 25" strokeWidth="2.8" strokeLinecap="round" className="stroke-[#2dd4bf]" />
      <path d="M11.4 14.8 13.6 17l4-4.4" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="stroke-[#2dd4bf]" />
    </svg>
  );
}

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2.5 rounded-md font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring", className)}
    >
      <LogoMark />
      <span className="text-[1.05rem]">
        Opportunity<span className="text-brand">Lens</span>
      </span>
    </Link>
  );
}
