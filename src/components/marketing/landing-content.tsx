"use client";

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
  GraduationCap,
  Microscope,
  Presentation,
  Shield,
  Sparkles,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PageShell } from "@/components/app-shell/page-shell";
import { PageContainer } from "@/components/app-shell/page-header";
import { Button } from "@/components/ui/button";
import { CATEGORY_PLURAL_LABELS } from "@/lib/domain/labels";
import type { Opportunity, OpportunityCategory } from "@/lib/domain/types";
import type { EligibilityResult } from "@/lib/eligibility";

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
    title: "See exactly why you qualify - or don't",
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
    tone: "success",
    title: "Meets stated requirements",
    body: "Every mandatory requirement is satisfied by information in your profile.",
  },
  {
    icon: CircleAlert,
    tone: "warning",
    title: "Potentially eligible / needs review",
    body: "Something is missing from your profile or can only be confirmed against the original source.",
  },
  {
    icon: CircleX,
    tone: "danger",
    title: "Does not meet stated requirements",
    body: "At least one mandatory requirement is clearly not met - and we show which one.",
  },
];

interface LandingContentProps {
  preview: Opportunity | null;
  previewResult: EligibilityResult | null;
}

export function LandingContent({ preview, previewResult }: LandingContentProps) {
  return (
    <PageShell background="space">
      <PageContainer>
        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-b from-background/60 to-background/90 p-8 md:p-12 lg:p-16 backdrop-blur-md">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.1),transparent_65%)] pointer-events-none" />
          <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-5"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/40 px-4 py-1.5 text-xs font-medium tracking-wide text-brand backdrop-blur-sm">
                <Sparkles className="size-3" />
                The next generation of opportunity discovery
              </div>
              <h1 className="font-display text-4xl leading-tight tracking-tight md:text-5xl lg:text-6xl text-gradient">
                Know if you qualify.
                <br />
                Know what to do next.
              </h1>
              <p className="max-w-lg text-sm text-muted-foreground md:text-base leading-relaxed">
                OpportunityLens helps students discover internships, scholarships, hackathons, fellowships,
                research programmes, grants and competitions — and understand, requirement by requirement,
                whether they qualify.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="h-11 px-6 bg-gradient-to-r from-mint to-teal text-[#03201c] font-semibold hover:opacity-90 transition-opacity">
                  <Link href="/onboarding">
                    Create your profile <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="ghost" className="h-11 px-6 border border-border/60 bg-card/30 hover:bg-card/60">
                  <a href="/app">
                    Open dashboard <ExternalLink className="ml-2 size-4" />
                  </a>
                </Button>
              </div>
              <div className="flex flex-wrap gap-4 border-t border-border/30 pt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Shield className="size-3.5 text-brand" /> Demo data - clear labels
                </span>
                <span className="flex items-center gap-1.5">
                  <BadgeCheck className="size-3.5 text-brand" /> No real applications
                </span>
              </div>
            </motion.div>

            {preview && previewResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative flex items-center justify-center"
              >
                <div className="glass-card relative w-full max-w-md p-6 bg-card/60 border-border/60 shadow-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-border/40">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-red-400/80" />
                      <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
                      <div className="h-3 w-3 rounded-full bg-green-400/80" />
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">opportunity-lens.app</span>
                  </div>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center gap-3 rounded-lg bg-background/60 p-3.5 border border-border/40">
                      <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-mint to-teal flex items-center justify-center text-[#03201c]">
                        <Briefcase className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">{preview.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{preview.providerName}</p>
                      </div>
                      <span className="rounded-full bg-mint/20 border border-mint/30 px-2.5 py-1 text-xs font-semibold text-mint">
                        {previewResult.outcome === "meets" ? "Meets" : previewResult.outcome}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-background/50 border border-border/30 p-3 text-center">
                        <p className="text-2xl font-bold text-mint">{previewResult.counts.met}</p>
                        <p className="text-xs text-muted-foreground font-medium">Requirements Met</p>
                      </div>
                      <div className="rounded-lg bg-background/50 border border-border/30 p-3 text-center">
                        <p className="text-2xl font-bold text-warning">{previewResult.counts.not_met}</p>
                        <p className="text-xs text-muted-foreground font-medium">Needs Review</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Categories */}
        <section className="mt-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="font-display text-2xl tracking-tight md:text-3xl text-gradient">
              Seven paths to your next step
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Every opportunity is evaluated against your profile, so you know exactly where you stand.
            </p>
          </motion.div>
          <motion.div
            className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {CATEGORIES.map(({ category, icon: Icon, blurb }) => (
              <div key={category} className="glass-card p-4 hover:border-brand/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex rounded-lg bg-brand/10 p-2.5 text-brand">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{CATEGORY_PLURAL_LABELS[category]}</p>
                    <p className="text-xs text-muted-foreground truncate">{blurb}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mt-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h2 className="font-display text-2xl tracking-tight md:text-3xl text-gradient">
              From profile to path in four steps
            </h2>
          </motion.div>
          <motion.div
            className="mt-8 grid gap-6 md:grid-cols-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {STEPS.map((step, index) => (
              <div key={step.title} className="glass-card relative p-6 hover:border-brand/40 transition-colors">
                <div
                  className={`absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    index % 2 === 0 ? "bg-mint/20 text-mint" : "bg-teal/20 text-teal"
                  }`}
                >
                  {index + 1}
                </div>
                <h3 className="font-semibold text-foreground text-sm">{step.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </motion.div>
        </section>

        {/* Outcomes */}
        <section className="mt-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <h2 className="font-display text-2xl tracking-tight md:text-3xl text-gradient">
              Know exactly where you stand
            </h2>
          </motion.div>
          <motion.div
            className="mt-6 grid gap-4 md:grid-cols-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            {OUTCOMES.map(({ icon: Icon, tone, title, body: desc }) => (
              <div key={title} className="glass-card p-6 hover:border-brand/40 transition-colors">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    tone === "success"
                      ? "bg-success/20 text-success"
                      : tone === "warning"
                        ? "bg-warning/20 text-warning"
                        : "bg-danger/20 text-danger"
                  }`}
                >
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-4 font-semibold text-foreground text-sm">{title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            ))}
          </motion.div>
        </section>

        {/* CTA */}
        <section className="mt-14 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="glass-card rounded-2xl p-8 md:p-12 text-center border-border/60 bg-gradient-to-b from-card/80 to-background/80"
          >
            <h2 className="font-display text-2xl tracking-tight md:text-3xl text-gradient">
              Ready to discover what you qualify for?
            </h2>
            <p className="mt-3 max-w-lg mx-auto text-sm text-muted-foreground">
              Build a profile in about three minutes. Every eligibility check gets sharper as you add detail.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="h-11 px-6 bg-gradient-to-r from-mint to-teal text-[#03201c] font-semibold">
                <Link href="/onboarding">
                  Create your profile <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="h-11 px-6 border border-border/60 bg-card/40">
                <a href="/app">
                  Open dashboard <ExternalLink className="ml-2 size-4" />
                </a>
              </Button>
            </div>
          </motion.div>
        </section>
      </PageContainer>
    </PageShell>
  );
}
