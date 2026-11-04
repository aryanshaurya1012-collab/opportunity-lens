"use client";

import {
  ArrowRight,
  Award,
  BadgeCheck,
  Bot,
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
  Zap,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { PageShell } from "@/components/app-shell/page-shell";
import { PageContainer } from "@/components/app-shell/page-header";
import { Badge } from "@/components/ui/badge";
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
    body: "At least one mandatory requirement is clearly not met — and we show which one.",
  },
];

interface LandingContentProps {
  preview: Opportunity | null;
  previewResult: EligibilityResult | null;
}

export function LandingContent({ preview, previewResult }: LandingContentProps) {
  const [activeTab, setActiveTab] = useState<"fit" | "bullets" | "interview">("fit");

  return (
    <PageShell background="space">
      <PageContainer>
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-b from-white via-slate-50/70 to-teal-50/20 p-8 shadow-sm backdrop-blur-md md:p-12 lg:p-16">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(13,148,136,0.08),transparent_65%)] pointer-events-none" />
          <div className="relative grid gap-10 md:grid-cols-2 md:items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-teal-800 shadow-xs">
                <Sparkles className="size-3.5 text-teal-600" />
                The next generation of opportunity discovery
              </div>
              <h1 className="font-display text-4xl leading-tight font-bold tracking-tight text-slate-950 md:text-5xl lg:text-6xl">
                Know if you qualify.
                <br />
                <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Know what to do next.
                </span>
              </h1>
              <p className="max-w-lg text-base leading-relaxed text-slate-600">
                OpportunityLens helps students discover internships, scholarships, hackathons, fellowships,
                research programmes, grants and competitions — and understand, requirement by requirement,
                whether they qualify.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  asChild
                  size="lg"
                  className="h-12 px-6 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold shadow-md shadow-teal-500/25 transition-all"
                >
                  <Link href="/onboarding">
                    Create your profile <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 px-6 border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold shadow-xs"
                >
                  <a href="/app">
                    Open dashboard <ExternalLink className="ml-2 size-4" />
                  </a>
                </Button>
              </div>
              <div className="flex flex-wrap gap-4 border-t border-slate-200/80 pt-4 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Shield className="size-4 text-teal-600" /> Verified criteria engine
                </span>
                <span className="flex items-center gap-1.5">
                  <BadgeCheck className="size-4 text-teal-600" /> Explainable verdicts
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
                <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-red-400" />
                      <div className="h-3 w-3 rounded-full bg-amber-400" />
                      <div className="h-3 w-3 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-xs font-mono font-medium text-slate-400">opportunitylens.app</span>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div className="flex items-center gap-3.5 rounded-xl bg-slate-50 p-3.5 border border-slate-200/80">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-xs">
                        <Briefcase className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 truncate">{preview.title}</p>
                        <p className="text-xs text-slate-500 truncate">{preview.providerName}</p>
                      </div>
                      <Badge className="bg-teal-100 text-teal-800 border-teal-200 font-semibold px-2.5 py-0.5">
                        {previewResult.outcome === "meets" ? "Meets" : "Needs Review"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3.5 text-center">
                        <p className="text-2xl font-extrabold text-emerald-700">{previewResult.counts.met}</p>
                        <p className="text-xs font-semibold text-emerald-800 mt-0.5">Requirements Met</p>
                      </div>
                      <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3.5 text-center">
                        <p className="text-2xl font-extrabold text-amber-700">{previewResult.counts.not_met}</p>
                        <p className="text-xs font-semibold text-amber-800 mt-0.5">Pending Review</p>
                      </div>
                    </div>

                    <div className="rounded-lg bg-teal-50/60 p-3 border border-teal-100 text-xs text-teal-900 flex items-center justify-between">
                      <span className="font-medium flex items-center gap-1.5">
                        <Sparkles className="size-3.5 text-teal-600" /> AI Fit Match
                      </span>
                      <span className="font-bold text-teal-700">94% Strategic Fit</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* AI Analysis Section (Anchored to #ai-analysis) */}
        <section id="ai-analysis" className="scroll-mt-24 mt-16">
          <div className="rounded-3xl border border-teal-200/80 bg-gradient-to-br from-teal-900 via-slate-900 to-navy p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-radial-gradient from-teal-500/20 to-transparent rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative grid gap-10 lg:grid-cols-[1.1fr_1fr] items-center">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/40 bg-teal-500/20 px-3.5 py-1 text-xs font-semibold text-teal-300">
                  <Bot className="size-4 text-teal-300" />
                  Intelligent Candidate Copilot
                </div>
                <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl text-white">
                  Generative AI Analysis &amp; Application Prep
                </h2>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                  Go beyond yes/no rules. Our AI Opportunity Studio synthesizes your coursework, skills, and
                  projects against any opportunity listing to deliver instant match scoring, tailored resume
                  bullets, and mock interview talking points.
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    asChild
                    size="lg"
                    className="h-11 px-6 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold shadow-lg shadow-teal-500/30"
                  >
                    <Link href="/app/ai-analysis">
                      Launch Interactive AI Studio <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-11 px-5 border-white/20 bg-white/10 hover:bg-white/20 text-white font-medium"
                  >
                    <a href="/about#architecture">
                      Architecture &amp; Model Specs <ExternalLink className="ml-2 size-3.5" />
                    </a>
                  </Button>
                </div>
              </div>

              {/* Interactive Preview Widget */}
              <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
                  <span className="font-semibold text-teal-300 flex items-center gap-1.5">
                    <Zap className="size-3.5" /> Live AI Engine Preview
                  </span>
                  <Badge variant="outline" className="border-teal-400/30 text-teal-300 text-[10px]">
                    Interactive
                  </Badge>
                </div>

                <div className="flex gap-1.5 p-1 rounded-lg bg-black/30 border border-white/10">
                  <button
                    onClick={() => setActiveTab("fit")}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      activeTab === "fit" ? "bg-teal-500 text-slate-950 shadow-xs" : "text-slate-300 hover:text-white"
                    }`}
                  >
                    Fit Analysis
                  </button>
                  <button
                    onClick={() => setActiveTab("bullets")}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      activeTab === "bullets" ? "bg-teal-500 text-slate-950 shadow-xs" : "text-slate-300 hover:text-white"
                    }`}
                  >
                    Resume Bullets
                  </button>
                  <button
                    onClick={() => setActiveTab("interview")}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      activeTab === "interview" ? "bg-teal-500 text-slate-950 shadow-xs" : "text-slate-300 hover:text-white"
                    }`}
                  >
                    Interview Prep
                  </button>
                </div>

                <div className="min-h-[160px] p-4 rounded-xl bg-slate-950/50 border border-white/10 text-xs text-slate-200">
                  {activeTab === "fit" && (
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center font-semibold text-teal-300">
                        <span>Overall Candidate Match</span>
                        <span className="text-sm font-bold">94%</span>
                      </div>
                      <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                        <div className="bg-teal-400 h-full w-[94%]" />
                      </div>
                      <p className="text-slate-300 leading-relaxed pt-1">
                        <strong className="text-white">Strength:</strong> Candidate demonstrates verified skills in
                        React, TypeScript, and Data Structures aligning with role prerequisites.
                      </p>
                      <p className="text-slate-300 leading-relaxed">
                        <strong className="text-amber-300">Action:</strong> Highlight open-source team project in
                        application to fulfill collaborative development criteria.
                      </p>
                    </div>
                  )}

                  {activeTab === "bullets" && (
                    <div className="space-y-2">
                      <p className="font-semibold text-teal-300">Tailored Resume Impact Statements:</p>
                      <ul className="space-y-2 text-slate-300 list-disc pl-4 leading-relaxed">
                        <li>Architected responsive frontend interfaces with Next.js and TypeScript, increasing engagement.</li>
                        <li>Automated requirement validation flows with unit test suites achieving 95% test coverage.</li>
                      </ul>
                    </div>
                  )}

                  {activeTab === "interview" && (
                    <div className="space-y-2">
                      <p className="font-semibold text-teal-300">Targeted Behavioral Question:</p>
                      <p className="text-white font-medium italic">
                        &quot;How do you ensure reliability when refactoring legacy components?&quot;
                      </p>
                      <p className="text-slate-300 text-[11px] pt-1">
                        <strong className="text-teal-400">Winning Strategy:</strong> Emphasize snapshot testing,
                        type safety, and incremental canary deploys.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Included with every listing in your dashboard</span>
                  <Link href="/app/ai-analysis" className="text-teal-300 font-semibold hover:underline flex items-center gap-1">
                    Try with any opportunity <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="mt-16">
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Seven paths to your next step
            </h2>
            <p className="max-w-xl text-sm text-slate-600">
              Every opportunity is evaluated against your profile, so you know exactly where you stand.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map(({ category, icon: Icon, blurb }) => (
              <div
                key={category}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-teal-500/50 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {CATEGORY_PLURAL_LABELS[category]}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{blurb}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-24 mt-16">
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              From profile to path in four steps
            </h2>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-4">
            {STEPS.map((step, index) => (
              <div
                key={step.title}
                className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition-all"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold ${
                    index % 2 === 0 ? "bg-teal-100 text-teal-800" : "bg-cyan-100 text-cyan-800"
                  }`}
                >
                  {index + 1}
                </div>
                <h3 className="font-bold text-slate-900 text-sm mt-4">{step.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Outcomes */}
        <section className="mt-16">
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Know exactly where you stand
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {OUTCOMES.map(({ icon: Icon, tone, title, body: desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition-all"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    tone === "success"
                      ? "bg-emerald-100 text-emerald-700"
                      : tone === "warning"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-rose-100 text-rose-700"
                  }`}
                >
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-4 font-bold text-slate-900 text-sm">{title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="mt-16 mb-12">
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-teal-50 via-white to-cyan-50 p-8 md:p-12 text-center shadow-xs">
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
              Ready to discover what you qualify for?
            </h2>
            <p className="mt-3 max-w-lg mx-auto text-sm text-slate-600">
              Build a profile in about three minutes. Every eligibility check gets sharper as you add detail.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="h-11 px-6 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold shadow-md shadow-teal-500/20"
              >
                <Link href="/onboarding">
                  Create your profile <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-11 px-6 border-slate-300 bg-white hover:bg-slate-50 text-slate-900 font-semibold"
              >
                <a href="/app">
                  Open dashboard <ExternalLink className="ml-2 size-4" />
                </a>
              </Button>
            </div>
          </div>
        </section>
      </PageContainer>
    </PageShell>
  );
}
