import {
  ArrowRight,
  Award,
  BadgeCheck,
  Briefcase,
  CircleAlert,
  CircleCheck,
  CircleX,
  Code2,
  ExternalLink,
  FlaskConical,
  GraduationCap,
  Lightbulb,
  Microscope,
  Presentation,
  Sparkles,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { FadeIn } from "@/components/marketing/fade-in";
import { ProductPreview } from "@/components/marketing/product-preview";
import { Button } from "@/components/ui/button";
import { SAMPLE_PROFILE } from "@/data/sample-profile";
import { getOpportunityRepository } from "@/lib/data";
import { CATEGORY_PLURAL_LABELS } from "@/lib/domain/labels";
import type { OpportunityCategory } from "@/lib/domain/types";
import { evaluateEligibility } from "@/lib/eligibility";
import { SERVER_REFERENCE_DATE } from "@/lib/domain/reference-date";

const CATEGORIES: { category: OpportunityCategory; icon: typeof Briefcase; blurb: string }[] = [
  { category: "internship", icon: Briefcase, blurb: "Industry roles with stipends and mentorship." },
  { category: "scholarship", icon: GraduationCap, blurb: "Merit and need-based funding for study." },
  { category: "hackathon", icon: Code2, blurb: "Build sprints with prizes and visibility." },
  { category: "fellowship", icon: Award, blurb: "Structured cohorts that accelerate careers." },
  { category: "research", icon: Microscope, blurb: "Lab placements and research assistantships." },
  { category: "grant_competition", icon: Trophy, blurb: "Seed grants, case and design competitions." },
  { category: "workshop_program", icon: Presentation, blurb: "Bootcamps and skill-building programmes." },
];

const STEPS = [
  {
    title: "Build a profile once",
    body: "Your course, year, grades, skills and projects become structured evidence. Sensitive details are optional and only stored with your consent.",
  },
  {
    title: "Discover across seven categories",
    body: "Search one catalogue of internships, scholarships, hackathons, fellowships, research, grants and workshops. Every listing shows its source and verification status.",
  },
  {
    title: "See exactly why you qualify — or don't",
    body: "Each stated requirement is compared with your profile. You get a verdict, the evidence behind it, and what is still missing.",
  },
  {
    title: "Act on it",
    body: "Save opportunities, follow concrete recommendations, and track every application from interested to accepted.",
  },
];

const OUTCOMES = [
  {
    icon: CircleCheck,
    tone: "text-success",
    title: "Meets stated requirements",
    body: "Every mandatory requirement is satisfied by information in your profile.",
  },
  {
    icon: CircleAlert,
    tone: "text-warning",
    title: "Potentially eligible / needs review",
    body: "Something is missing from your profile or can only be confirmed against the original source.",
  },
  {
    icon: CircleX,
    tone: "text-danger",
    title: "Does not meet stated requirements",
    body: "At least one mandatory requirement is clearly not met — and we show which one.",
  },
];

export default async function LandingPage() {
  const repository = getOpportunityRepository();
  const preview = await repository.getBySlug("northwind-frontend-engineering-intern");
  const previewResult = preview ? evaluateEligibility(SAMPLE_PROFILE, preview, SERVER_REFERENCE_DATE) : null;

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(11_27_50/0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgb(11_27_50/0.04)_1px,transparent_1px)] bg-size-[56px_56px] mask-[radial-gradient(ellipse_at_top_left,black_30%,transparent_70%)]"
        />
        <div className="container-page relative grid items-center gap-14 py-16 md:py-24 lg:grid-cols-[1.05fr_1fr]">
          <div className="space-y-7">
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-brand" /> Opportunity intelligence for students
            </p>
            <h1 className="font-display text-5xl leading-[1.02] tracking-tight text-navy md:text-6xl lg:text-[4.4rem]">
              Know if you qualify.
              <br />
              <em className="text-brand">Know what to do next.</em>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              OpportunityLens brings internships, scholarships, hackathons, fellowships, research programmes,
              grants and workshops into one place — and explains, requirement by requirement, whether your
              profile meets them.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="h-11 px-5 text-[0.95rem]">
                <a href="/onboarding">
                  Build your profile <ArrowRight data-icon="inline-end" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-11 px-5 text-[0.95rem]">
                <Link href="/opportunities">Browse opportunities</Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              No account needed in demo mode. Your data stays in your browser.
            </p>
          </div>
          {preview && previewResult && <ProductPreview opportunity={preview} result={previewResult} />}
        </div>
      </section>

      <section aria-labelledby="categories-heading" className="container-page py-16 md:py-20">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="max-w-xl space-y-3">
            <h2 id="categories-heading" className="font-display text-3xl tracking-tight text-navy md:text-4xl">
              One lens across every kind of opportunity
            </h2>
            <p className="text-muted-foreground">
              A shared data model means the same eligibility engine works for a hackathon, a research placement
              or a scholarship.
            </p>
          </div>
          <Link href="/opportunities" className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline">
            Explore all <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
        <ul className="mt-10 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map(({ category, icon: Icon, blurb }) => (
            <li key={category} className="bg-card">
              <Link
                href={`/opportunities?category=${category}`}
                className="group flex h-full flex-col gap-3 p-5 transition-colors hover:bg-accent/60 focus-visible:bg-accent/60 focus-visible:outline-none"
              >
                <Icon aria-hidden className="size-5 text-brand" />
                <span className="font-medium">{CATEGORY_PLURAL_LABELS[category]}</span>
                <span className="text-sm text-muted-foreground">{blurb}</span>
              </Link>
            </li>
          ))}
          <li className="flex flex-col justify-center gap-2 bg-navy p-5 text-white">
            <span className="text-sm font-medium">Built to extend</span>
            <span className="text-sm text-white/70">New categories plug into the same requirement model.</span>
          </li>
        </ul>
      </section>

      <section id="how-it-works" aria-labelledby="how-heading" className="border-y border-border bg-card">
        <div className="container-page grid gap-12 py-16 md:py-24 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <p className="text-sm font-medium text-brand">How it works</p>
            <h2 id="how-heading" className="font-display text-3xl tracking-tight text-navy md:text-4xl">
              From “am I even eligible?” to a submitted application.
            </h2>
            <p className="text-muted-foreground">
              Most students lose hours reading eligibility criteria that don&apos;t apply to them. OpportunityLens
              does the comparison for you, and shows its work.
            </p>
          </div>
          <ol className="space-y-0">
            {STEPS.map((step, index) => (
              <li key={step.title} className="border-b border-border last:border-0">
                <FadeIn delay={index * 0.05} className="grid grid-cols-[3rem_1fr] gap-4 py-7">
                  <span className="font-display text-3xl text-brand tabular-nums">0{index + 1}</span>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.body}</p>
                  </div>
                </FadeIn>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="transparency-heading" className="container-page grid gap-12 py-16 md:py-24 lg:grid-cols-2">
        <div className="space-y-6">
          <h2 id="transparency-heading" className="font-display text-3xl tracking-tight text-navy md:text-4xl">
            Three honest outcomes. Never a guess.
          </h2>
          <p className="text-muted-foreground">
            Eligibility is evaluated against the provider&apos;s stated requirements. Missing information is
            never treated as a pass, and conditions that can&apos;t be checked automatically are flagged for
            manual review.
          </p>
          <ul className="space-y-4">
            {OUTCOMES.map(({ icon: Icon, tone, title, body }) => (
              <li key={title} className="flex gap-4">
                <Icon aria-hidden className={`mt-0.5 size-5 shrink-0 ${tone}`} />
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-sm text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-6 rounded-lg border border-border bg-card p-6 md:p-8">
          <div className="flex items-center gap-3">
            <BadgeCheck aria-hidden className="size-5 text-brand" />
            <h3 className="text-lg font-semibold">Source transparency</h3>
          </div>
          <p className="text-muted-foreground">
            Every published listing links to its original source and shows when it was last verified. Listings
            that can&apos;t be verified are labelled — never presented as confirmed.
          </p>
          <div className="space-y-3 border-t border-border pt-6">
            <div className="flex items-center gap-3">
              <FlaskConical aria-hidden className="size-5 text-warning" />
              <h3 className="text-lg font-semibold">Demo data is always labelled</h3>
            </div>
            <p className="text-muted-foreground">
              This hackathon build ships with fictional sample listings so you can try the full journey. They
              carry a “Demo data” badge everywhere and have no real application links.
            </p>
          </div>
        </div>
      </section>

      <section id="ai-analysis" aria-labelledby="ai-heading" className="border-t border-border bg-navy text-white">
        <div className="container-page grid gap-10 py-16 md:py-20 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div className="space-y-5">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-[#5eead4]">
              <Sparkles aria-hidden className="size-4" /> Generative AI analysis
            </p>
            <h2 id="ai-heading" className="font-display text-3xl tracking-tight md:text-4xl">
              Go deeper with our Amazon PartyRock app.
            </h2>
            <p className="text-white/75">
              Paste an opportunity description and your background into our PartyRock app for AI-generated
              guidance on your fit and how to prepare. It runs on Amazon PartyRock in a separate tab — nothing
              from this site is sent automatically, and the output is guidance, not an eligibility decision.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-11 bg-[#2dd4bf] px-5 text-[#03201c] hover:bg-[#5eead4]">
                <a href="/app/ai-analysis">
                  Learn about AI analysis <ArrowRight data-icon="inline-end" />
                </a>
              </Button>
            </div>
          </div>
          <ul className="space-y-3 text-sm text-white/80">
            {[
              "Rules engine on this site: deterministic, explainable, instant.",
              "PartyRock app: open-ended generative guidance on the text you provide.",
              "Planned: Amazon Bedrock-powered analysis inside OpportunityLens.",
            ].map((line) => (
              <li key={line} className="flex gap-3 border-b border-white/10 pb-3 last:border-0">
                <Lightbulb aria-hidden className="mt-0.5 size-4 shrink-0 text-[#5eead4]" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-page py-16 md:py-24">
        <div className="flex flex-col items-start justify-between gap-6 rounded-lg border border-border bg-card p-8 md:flex-row md:items-center md:p-10">
          <div className="space-y-2">
            <h2 className="font-display text-3xl tracking-tight text-navy">Start with your profile.</h2>
            <p className="text-muted-foreground">
              It takes about three minutes, and every eligibility check gets sharper as you add detail.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-11 px-5">
              <a href="/onboarding">
                Create your profile <ArrowRight data-icon="inline-end" />
              </a>
            </Button>
            <Button asChild size="lg" variant="ghost" className="h-11 px-5">
              <a href="/app">
                Open dashboard <ExternalLink data-icon="inline-end" />
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
