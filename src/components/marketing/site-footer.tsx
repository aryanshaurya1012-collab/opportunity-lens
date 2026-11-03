import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { SITE_TAGLINE } from "@/lib/site";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/opportunities", label: "Discover opportunities" },
      { href: "/app/eligibility", label: "Eligibility check" },
      { href: "/app/applications", label: "Application tracker" },
      { href: "/app/ai-analysis", label: "AI analysis (PartyRock)" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/about#data-principles", label: "Data principles" },
      { href: "/about#architecture", label: "Architecture" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="max-w-sm space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground">{SITE_TAGLINE}</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            This build runs in demonstration mode. All listings shown are fictional sample data and are
            not real, verified or currently open opportunities.
          </p>
        </div>
        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h2 className="text-sm font-semibold">{column.title}</h2>
            <ul className="mt-3 space-y-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith("/app") ? (
                    <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
