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
  Shield,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PageShell } from "@/components/app-shell/page-shell";
import { PageContainer } from "@/components/app-shell/page-header";
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
  { title: "Build a profile once", body: "Your course, year, grades, skills and projects become structured evidence. Sensitive details are optional and only stored with your consent." },
  { title: "Discover across seven categories", body: "Search one catalogue of internships, scholarships, hackathons, fellowships, research, grants and workshops. Every listing shows its source and verification status." },
  { title: "See exactly why you qualify - or don't", body: "Each stated requirement is compared with your profile. You get a verdict, the evidence behind it, and what is still missing." },
  { title: "Act on it", body: "Save opportunities, follow concrete recommendations, and track every application from interested to accepted." },
];

const OUTCOMES = [
  { icon: CircleCheck, tone: "success", title: "Meets stated requirements", body: "Every mandatory requirement is satisfied by information in your profile." },
  { icon: CircleAlert, tone: "warning", title: "Potentially eligible / needs review", body: "Something is missing from your profile or can only be confirmed against the original source." },
  { icon: CircleX, tone: "danger", title: "Does not meet stated requirements", body: "At least one mandatory requirement is clearly not met - and we show which one." },
];

export default async function LandingPage() {
  const repository = getOpportunityRepository();
  const preview = await repository.getBySlug("northwind-frontend-engineering-intern");
  const previewResult = preview ? evaluateEligibility(SAMPLE_PROFILE, preview, SERVER_REFERENCE_DATE) : null;

  return (
    <PageShell background="space">
      <PageContainer>
        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-b from-background/60 to-background p-8 md:p-12 lg:p-16">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.08),transparent_60%)] pointer-events-none" />
          <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/30 px-4 py-1.5 text-xs font-medium tracking-wide text-brand/80 backdrop-blur-sm">
                <Sparkles className="size-3" />
                The next generation of opportunity discovery
              </div>
              <h1 className="font-display text-4xl leading-tight tracking-tight md:text-5xl lg:text-6xl text-gradient">
                Know if you qualify.
                <br />
                Know what to do next.
              </h1>
              <p className="max-w-lg text-sm text-muted-foreground/90 md:text-base">
                OpportunityLens helps students discover internships, scholarships, hackathons, fellowships, research programmes, grants and competitions - and understand, requirement by requirement, whether they qualify.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="h-11 px-6 bg-gradient-to-r from-mint to-teal text-[#03201c]">
                  <Link href="/onboarding">Create your profile <ArrowRight className="ml-2 size-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="ghost" className="h-11 px-6 border-border/50 bg-background/30">
                  <a href="/app">Open dashboard <ExternalLink className="ml-2 size-4" /></a>
                </Button>
              </div>
              <div className="flex flex-wrap gap-4 border-t border-border/30 pt-4 text-xs text-muted-foreground/70">
                <span className="flex items-center gap-1.5"><Shield className="size-3" /> Demo data - clear labels</span>
                <span className="flex items-center gap-1.5"><BadgeCheck className="size-3" /> No real applications</span>
                </div>
            </motion.div>
            {preview && previewResult && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative flex items-center justify-center">
                <div className="glass-card relative w-full max-w-md p-6">
                  <div className="flex items-center gap-3 pb-3 border-b border-border/30">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-red-400/60" />
                      <div className="h-3 w-3 rounded-full bg-yellow-400/60" />
                      <div className="h-3 w-3 rounded-full bg-green-400/60" />
                    </div>
                    <span className="text-xs text-muted-foreground">opportunity-lens.app</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 rounded-lg bg-background/50 p-3">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-mint to-teal flex items-center justify-center text-white text-sm">
                        <Briefcase className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground/90 truncate">{preview.title}</p>
                        <p className="text-xs text-muted-foreground/70 truncate">{preview.provider}</p>
                      </div>
                      <span className="rounded-full bg-mint/20 px-2.5 py-1 text-xs font-medium text-mint/80">
                        {previewResult.outcome}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-background/50 p-3 text-center">
                        <p className="text-xl font-bold text-foreground/90">{previewResult.meetsCount}</p>
                        <p className="text-xs text-muted-foreground/70">Meets</p>
                      </div>
                      <div className="rounded-lg bg-background/50 p-3 text-center">
                        <p className="text-xl font-bold text-foreground/90">{previewResult.needsReviewCount}</p>
                        <p className="text-xs text-muted-foreground/70">Review</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Categories */}
        <section className="mt-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
            <h2 className="font-display text-2xl tracking-tight md:text-3xl text-gradient">Seven paths to your next step</h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground/90">Every opportunity is evaluated against your profile, so you know exactly where you stand.</p>
          </motion.div>
          <motion.div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
            {CATEGORIES.map(({ category, icon: Icon, blurb }) => (
              <div key={category} className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5 rounded-lg bg-background/50 p-2.5">
                    <Icon className="size-4 text-brand" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground/90 truncate">{CATEGORY_PLURAL_LABELS[category]}</p>
                    <p className="text-xs text-muted-foreground/70 truncate">{blurb}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* How it works */}
        <section className="mt-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
            <h2 className="font-display text-2xl tracking-tight md:text-3xl text-gradient">From profile to path in four steps</h2>
          </motion.div>
          <motion.div className="mt-8 grid gap-6 md:grid-cols-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}>
            {STEPS.map((step, index) => (
              <div key={step.title} className="glass-card p-6">
                <div className={`absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${(index % 2 === 0 ? "bg-mint/20" : "bg-teal/20")}`}>
                  {index + 1}
                </div>
                <h3 className="font-medium text-foreground/90">{step.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground/70">{step.body}</p>
              </div>
            ))}
          </motion.div>
        </section>

        {/* Outcomes */}
        <section className="mt-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }}>
            <h2 className="font-display text-2xl tracking-tight md:text-3xl text-gradient">Know exactly where you stand</h2>
          </motion.div>
          <motion.div className="mt-6 grid gap-4 md:grid-cols-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }}>
            {OUTCOMES.map(({ icon: Icon, tone, title, body: desc }) => (
              <div key={title} className="glass-card p-6">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${tone === "success" ? "bg-success/20" : tone === "warning" ? "bg-warning/20" : "bg-danger/20"} text-${tone === "success" ? "success" : tone === "warning" ? "warning" : "danger"}/60`}>
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-4 font-medium text-foreground/90">{title}</h3>
                <p className="mt-1 text-xs text-muted-foreground/70">{desc}</p>
              </div>
            ))}
          </motion.div>
        </section>

        {/* CTA */}
        <section className="mt-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.9 }} className="glass-card rounded-2xl p-8 md:p-10 text-center">
            <h2 className="font-display text-2xl tracking-tight md:text-3xl text-gradient">Ready to discover what you qualify for?</h2>
            <p className="mt-3 max-w-lg mx-auto text-sm text-muted-foreground/90">Build a profile in about three minutes. Every eligibility check gets sharper as you add detail.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="h-11 px-6 bg-gradient-to-r from-mint to-teal text-[#03201c]">
                <Link href="/onboarding">Create your profile <ArrowRight className="ml-2 size-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="h-11 px-6 border-border/50 bg-background/30">
                <a href="/app">Open dashboard <ExternalLink className="ml-2 size-4" /></a>
              </Button>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-border/50 pt-8">
          <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground/70">
              <Sparkles className="size-4 text-brand" />
              <span className="font-medium text-foreground/80">OpportunityLens</span>
              <span className="hidden sm:inline">·</span>
              <span>Demo build - all data is fictional.</span>
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground/60">
              <a href="/about" className="hover:text-foreground/90 transition-colors">About</a>
              <a href="/app" className="hover:text-foreground/90 transition-colors">Dashboard</a>
              <a href="/app/ai-analysis" className="hover:text-foreground/90 transition-colors">AI Analysis</a>
            </div>
          </div>
        </footer>
      </PageContainer>
    </PageShell>
  );
}