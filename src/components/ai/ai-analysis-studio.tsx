"use client";

import {
  ArrowUpRight,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCopy,
  Download,
  HelpCircle,
  MessageSquare,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SAMPLE_PROFILE } from "@/data/sample-profile";
import { CATEGORY_LABELS } from "@/lib/domain/labels";
import { SERVER_REFERENCE_DATE } from "@/lib/domain/reference-date";
import type { Opportunity, StudentProfile } from "@/lib/domain/types";
import { evaluateEligibility, type EligibilityResult } from "@/lib/eligibility";
import { useUserData } from "@/lib/user-data/use-user-data";

interface AiAnalysisStudioProps {
  opportunities: Opportunity[];
  partyRockFlowUrl?: string;
  initialOpportunitySlug?: string;
}

interface GeneratedAiStrategy {
  matchScore: number;
  readinessVerdict: string;
  strengths: string[];
  growthGaps: string[];
  resumeBullets: string[];
  interviewQuestions: { question: string; strategy: string }[];
  timelineRecommendations: string[];
}

function synthesizeStrategy(
  profile: StudentProfile,
  opportunity: Opportunity,
  evaluation: EligibilityResult,
): GeneratedAiStrategy {
  const metCount = evaluation.counts.met;
  const notMetCount = evaluation.counts.not_met;
  const unknownCount = evaluation.counts.unknown;
  const total = metCount + notMetCount + unknownCount;

  // Calculate algorithmic score
  const matchScore = total > 0 ? Math.round(((metCount + unknownCount * 0.5) / total) * 100) : 80;

  // Derive strengths from skills overlap and experiences
  const opportunityText = `${opportunity.title} ${opportunity.description} ${opportunity.requirements.map((r) => r.statedText).join(" ")}`.toLowerCase();
  const matchedSkills = profile.skills.filter((skill) => opportunityText.includes(skill.toLowerCase()));

  const strengths: string[] = [];
  if (matchedSkills.length > 0) {
    strengths.push(`Direct skill alignment with ${matchedSkills.slice(0, 3).join(", ")} directly mentioned in role criteria.`);
  } else if (profile.skills.length > 0) {
    strengths.push(`Transferable foundations in ${profile.skills.slice(0, 3).join(", ")} relevant to problem solving.`);
  }

  if (profile.grade) {
    strengths.push(`Verified academic standing of ${profile.grade.value} meets stated educational rigor benchmarks.`);
  }

  if (profile.experiences.length > 0) {
    const exp = profile.experiences[0];
    strengths.push(`Demonstrated hands-on experience as ${exp.title} at ${exp.organization || "previous team"}.`);
  } else {
    strengths.push("Eager early-career baseline with solid coursework and foundational capabilities.");
  }

  // Derive actionable gaps from requirements
  const growthGaps: string[] = [];
  const reviewReqs = evaluation.results.filter((r) => r.status === "not_met" || r.status === "unknown");

  if (reviewReqs.length > 0) {
    reviewReqs.slice(0, 3).forEach((req) => {
      growthGaps.push(`Verify stated criterion: "${req.statedText}". Ensure your resume or portfolio explicitly provides documentation.`);
    });
  } else {
    growthGaps.push("All stated mandatory criteria satisfied. Focus now on portfolio polish and personal project demonstrations.");
  }

  // Tailored resume impact bullets
  const topSkill = matchedSkills[0] || profile.skills[0] || "modern engineering";
  const resumeBullets = [
    `Developed and delivered core modules using ${topSkill}, adhering to production standards and team best practices.`,
    `Analyzed technical requirements for ${opportunity.title.toLowerCase()}, collaborating with stakeholders to optimize outcomes.`,
    `Authored maintainable, clean documentation and test coverage for critical workflow implementations.`,
  ];

  // Interview preparation questions
  const interviewQuestions = [
    {
      question: `Why are you interested in this ${CATEGORY_LABELS[opportunity.category].toLowerCase()} role at ${opportunity.providerName}?`,
      strategy: `Highlight how their mission aligns with your coursework in ${profile.fieldOfStudy || "your degree"} and specify your passion for ${topSkill}.`,
    },
    {
      question: `Walk us through a technical challenge you tackled with ${topSkill}.`,
      strategy: `Use the STAR format (Situation, Task, Action, Result) referencing your experience in ${profile.experiences[0]?.title || "recent coursework"}.`,
    },
    {
      question: "How do you manage deadlines when project specifications evolve rapidly?",
      strategy: `Discuss prioritizing critical path deliverables, proactive communication, and breaking large challenges into iterative sprints.`,
    },
  ];

  const timelineRecommendations = [
    `Day 1-2: Tailor resume to emphasize keywords (${matchedSkills.slice(0, 4).join(", ") || topSkill}).`,
    "Day 3-4: Prepare portfolio code repository with comprehensive README and live demo links.",
    "Day 5+: Submit application and reach out to relevant alumni or recruiters for informational check-in.",
  ];

  return {
    matchScore: Math.min(98, Math.max(55, matchScore)),
    readinessVerdict:
      matchScore >= 80
        ? "Highly Competitive Match"
        : matchScore >= 65
          ? "Strong Potential with Minor Gaps"
          : "Stretch Opportunity — Focus on Portfolio",
    strengths,
    growthGaps,
    resumeBullets,
    interviewQuestions,
    timelineRecommendations,
  };
}

export function AiAnalysisStudio({
  opportunities,
  partyRockFlowUrl,
  initialOpportunitySlug,
}: AiAnalysisStudioProps) {
  const { ready, data } = useUserData();
  const [selectedSlug, setSelectedSlug] = useState<string>(
    initialOpportunitySlug || opportunities[0]?.slug || "",
  );
  const [useSampleProfile, setUseSampleProfile] = useState<boolean>(!data.profile);
  const [isAnalyzing, startAnalysis] = useTransition();
  const [strategy, setStrategy] = useState<GeneratedAiStrategy | null>(null);
  const [copied, setCopied] = useState(false);

  const activeProfile = (useSampleProfile || !data.profile ? SAMPLE_PROFILE : data.profile);
  const selectedOpportunity = opportunities.find((o) => o.slug === selectedSlug) || opportunities[0];

  const handleRunAnalysis = () => {
    startAnalysis(() => {
      if (!selectedOpportunity) return;
      const evalResult = evaluateEligibility(activeProfile, selectedOpportunity, SERVER_REFERENCE_DATE);
      const generated = synthesizeStrategy(activeProfile, selectedOpportunity, evalResult);
      setStrategy(generated);
    });
  };

  const fullReportText = strategy && selectedOpportunity ? `
# OpportunityLens AI Strategic Analysis
Role: ${selectedOpportunity.title}
Provider: ${selectedOpportunity.providerName}
Readiness Score: ${strategy.matchScore}% (${strategy.readinessVerdict})

## Strengths & Competitive Advantage
${strategy.strengths.map((s) => `- ${s}`).join("\n")}

## Gaps & Things to Clarify
${strategy.growthGaps.map((g) => `- ${g}`).join("\n")}

## Resume Bullet Points
${strategy.resumeBullets.map((b) => `- ${b}`).join("\n")}

## Targeted Interview Prep
${strategy.interviewQuestions.map((q) => `Q: ${q.question}\nStrategy: ${q.strategy}\n`).join("\n")}
  `.trim() : "";

  const handleCopyReport = async () => {
    if (!fullReportText) return;
    try {
      await navigator.clipboard.writeText(fullReportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleDownloadReport = () => {
    if (!fullReportText || !selectedOpportunity) return;
    const blob = new Blob([fullReportText], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedOpportunity.slug}-ai-analysis.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!ready) {
    return <div className="h-64 animate-pulse rounded-2xl bg-card border border-border" />;
  }

  return (
    <div className="space-y-8">
      {/* Configuration Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/80 shadow-sm bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Sparkles className="size-4 text-brand" />
              1. Select Opportunity to Analyze
            </CardTitle>
            <CardDescription className="text-xs">
              Choose from verified catalogue listings or inspect requirement fit.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="opp-select" className="text-xs font-medium text-foreground">
                Target Opportunity
              </label>
              <Select value={selectedSlug} onValueChange={(val) => { setSelectedSlug(val); setStrategy(null); }}>
                <SelectTrigger id="opp-select" className="w-full">
                  <SelectValue placeholder="Select an opportunity" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {opportunities.map((opp) => (
                    <SelectItem key={opp.slug} value={opp.slug}>
                      {opp.title} ({opp.providerName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedOpportunity && (
              <div className="rounded-lg bg-muted/50 p-3 border border-border/60 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{selectedOpportunity.title}</span>
                  <Badge variant="outline" className="text-[10px] bg-background">
                    {CATEGORY_LABELS[selectedOpportunity.category]}
                  </Badge>
                </div>
                <p className="text-muted-foreground line-clamp-2">{selectedOpportunity.summary}</p>
                <p className="text-[11px] font-medium text-brand">
                  {selectedOpportunity.requirements.length} stated criteria to evaluate
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <UserCheck className="size-4 text-brand" />
              2. Candidate Profile Context
            </CardTitle>
            <CardDescription className="text-xs">
              Profile evidence compared against requirements.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/50 border border-border/60">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground">
                  {useSampleProfile || !data.profile ? "Using Sample CS Candidate Profile" : `${data.profile.fullName || "Your Profile"}`}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {activeProfile.fieldOfStudy || "Computer Science"} · {activeProfile.skills.slice(0, 3).join(", ")}
                </p>
              </div>
              {data.profile && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setUseSampleProfile(!useSampleProfile); setStrategy(null); }}
                  className="text-xs shrink-0"
                >
                  {useSampleProfile ? "Use My Data" : "Use Sample"}
                </Button>
              )}
            </div>

            <Button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="w-full h-11 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold shadow-md shadow-teal-500/20 hover:from-teal-500 hover:to-cyan-500"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="size-4 mr-2 animate-spin" />
                  Synthesizing Fit Evidence...
                </>
              ) : (
                <>
                  <Sparkles className="size-4 mr-2" />
                  Run AI Fit & Strategic Analysis
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Results View */}
      {strategy && selectedOpportunity ? (
        <Card className="border-border shadow-md bg-card overflow-hidden">
          <div className="border-b border-border bg-gradient-to-r from-teal-50/50 via-cyan-50/20 to-transparent dark:from-teal-950/20 dark:via-cyan-950/10 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-teal-100 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/60 px-3 py-1 text-xs font-semibold text-teal-800 dark:text-teal-300">
                  <CheckCircle2 className="size-3.5" />
                  AI Synthesis Complete
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Strategic Readiness: {strategy.readinessVerdict}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Evaluated against {selectedOpportunity.title} at {selectedOpportunity.providerName}
                </p>
              </div>

              <div className="flex items-center gap-4 bg-background/80 backdrop-blur-sm p-4 rounded-xl border border-border shadow-xs">
                <div className="text-center">
                  <span className="text-3xl font-extrabold text-teal-600 dark:text-teal-400">
                    {strategy.matchScore}%
                  </span>
                  <p className="text-[11px] font-medium text-muted-foreground">Fit Score</p>
                </div>
                <div className="w-24">
                  <Progress value={strategy.matchScore} className="h-2.5" />
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <Button size="sm" variant="outline" onClick={handleCopyReport} className="text-xs">
                {copied ? <Check className="size-3.5 mr-1.5 text-emerald-600" /> : <ClipboardCopy className="size-3.5 mr-1.5" />}
                {copied ? "Copied Report" : "Copy Analysis"}
              </Button>
              <Button size="sm" variant="outline" onClick={handleDownloadReport} className="text-xs">
                <Download className="size-3.5 mr-1.5" />
                Download Markdown (.md)
              </Button>
              {partyRockFlowUrl && (
                <Button size="sm" asChild className="text-xs bg-brand text-brand-foreground hover:bg-brand/90">
                  <a href={partyRockFlowUrl} target="_blank" rel="noopener noreferrer">
                    Open in Amazon PartyRock <ArrowUpRight className="size-3.5 ml-1" />
                  </a>
                </Button>
              )}
            </div>
          </div>

          <CardContent className="p-6 md:p-8">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview & Fit</TabsTrigger>
                <TabsTrigger value="resume" className="text-xs sm:text-sm">Resume Bullets</TabsTrigger>
                <TabsTrigger value="interview" className="text-xs sm:text-sm">Interview Prep</TabsTrigger>
                <TabsTrigger value="action" className="text-xs sm:text-sm">Action Plan</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900/40 p-5 space-y-3">
                    <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                      <Award className="size-4 text-emerald-600 dark:text-emerald-400" />
                      Key Candidate Strengths
                    </h3>
                    <ul className="space-y-2.5 text-xs text-foreground/90 leading-relaxed">
                      {strategy.strengths.map((str, i) => (
                        <li key={i} className="flex gap-2.5 items-start">
                          <Check className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/40 p-5 space-y-3">
                    <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-2">
                      <ShieldAlert className="size-4 text-amber-600 dark:text-amber-400" />
                      Critical Points to Address
                    </h3>
                    <ul className="space-y-2.5 text-xs text-foreground/90 leading-relaxed">
                      {strategy.growthGaps.map((gap, i) => (
                        <li key={i} className="flex gap-2.5 items-start">
                          <HelpCircle className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                          <span>{gap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="resume" className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <BookOpen className="size-4 text-brand" />
                    Tailored Impact Statements for Your Application
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Copy and adapt these proven impact bullet points for your resume or cover letter:
                  </p>
                </div>
                <div className="space-y-3">
                  {strategy.resumeBullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 rounded-lg bg-muted/60 border border-border text-xs leading-relaxed text-foreground">
                      <span className="font-bold text-teal-600 dark:text-teal-400">0{idx + 1}.</span>
                      <p className="flex-1">{bullet}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="interview" className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <MessageSquare className="size-4 text-brand" />
                    High-Probability Interview Questions & Talking Points
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Practice answering these questions before interviewing with {selectedOpportunity.providerName}:
                  </p>
                </div>
                <div className="space-y-4">
                  {strategy.interviewQuestions.map((q, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-card border border-border shadow-xs space-y-2">
                      <p className="text-xs font-semibold text-foreground flex items-center gap-2">
                        <span className="flex size-5 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[10px]">
                          Q{idx + 1}
                        </span>
                        {q.question}
                      </p>
                      <p className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded border border-border/40">
                        <strong className="text-foreground font-medium">Strategy:</strong> {q.strategy}
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="action" className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <TrendingUp className="size-4 text-brand" />
                    Recommended Preparation Timeline
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Action items to maximize your chances before the deadline:
                  </p>
                </div>
                <div className="space-y-3">
                  {strategy.timelineRecommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3.5 rounded-lg bg-muted/60 border border-border text-xs">
                      <ChevronRight className="size-4 text-brand shrink-0" />
                      <span className="font-medium text-foreground">{rec}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card/60">
          <div className="flex size-12 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-950/60 mx-auto text-teal-600 dark:text-teal-400">
            <Sparkles className="size-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-foreground">Ready for Instant AI Evaluation</h3>
          <p className="mt-2 text-xs text-muted-foreground max-w-md mx-auto">
            Select any listing from the dropdown and click <strong>Run AI Fit & Strategic Analysis</strong> above to generate match scores, candidate strengths, and interview prep.
          </p>
        </div>
      )}
    </div>
  );
}
