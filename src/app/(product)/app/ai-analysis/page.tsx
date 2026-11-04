import { ArrowUpRight, Cpu, ShieldCheck, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { PageShell } from "@/components/app-shell/page-shell";
import { PageContainer, PageHeader } from "@/components/app-shell/page-header";
import { AiAnalysisStudio } from "@/components/ai/ai-analysis-studio";
import { CopyContextPanel } from "@/components/ai/copy-context-panel";
import { Button } from "@/components/ui/button";
import { publicConfig } from "@/lib/config";
import { getOpportunityRepository } from "@/lib/data";

export const metadata: Metadata = { title: "AI analysis & Strategy" };

export default async function AiAnalysisPage() {
  const flowUrl = publicConfig.partyRockFlowUrl;
  const opportunities = await getOpportunityRepository().listPublished();

  return (
    <PageShell background="none">
      <PageContainer>
        <PageHeader
          eyebrow="Generative AI & Strategy"
          title="Interactive AI Fit & Application Studio"
          description="Synthesize your background against stated opportunity requirements for real-time match scoring, resume impact statements, and custom interview prep."
        />

        <div className="space-y-12">
          {/* Main Interactive AI Studio */}
          <AiAnalysisStudio opportunities={opportunities} partyRockFlowUrl={flowUrl ?? undefined} />

          {/* Additional Context and Deep PartyRock Integration */}
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] pt-8 border-t border-border/80">
            <div className="space-y-6">
              <section aria-labelledby="how-heading" className="space-y-4">
                <h2 id="how-heading" className="text-base font-semibold text-foreground flex items-center gap-2">
                  <ShieldCheck className="size-4 text-brand" />
                  How AI Analysis Fits into OpportunityLens
                </h2>
                <dl className="divide-y divide-border rounded-xl border border-border bg-card text-xs">
                  <div className="grid gap-1 p-4 sm:grid-cols-[11rem_1fr]">
                    <dt className="font-semibold text-foreground flex items-center gap-2">
                      <ShieldCheck className="size-3.5 text-brand" /> Rules Engine
                    </dt>
                    <dd className="text-muted-foreground">
                      Deterministic, explainable verification of mandatory prerequisites.
                    </dd>
                  </div>
                  <div className="grid gap-1 p-4 sm:grid-cols-[11rem_1fr]">
                    <dt className="font-semibold text-foreground flex items-center gap-2">
                      <Sparkles className="size-3.5 text-brand" /> In-App AI Studio
                    </dt>
                    <dd className="text-muted-foreground">
                      Instant strategic candidate scoring, customized application bullets, and interview prompts.
                    </dd>
                  </div>
                  <div className="grid gap-1 p-4 sm:grid-cols-[11rem_1fr]">
                    <dt className="font-semibold text-foreground flex items-center gap-2">
                      <Cpu className="size-3.5 text-brand" /> Amazon PartyRock
                    </dt>
                    <dd className="text-muted-foreground">
                      Public generative prototype for open-ended exploratory chat and document drafting.
                    </dd>
                  </div>
                </dl>
              </section>

              {flowUrl ? (
                <section className="p-5 rounded-xl border border-border bg-card/60 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Launch Amazon PartyRock External App</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    You can launch our companion PartyRock app in a separate tab to interactively explore open-ended guidance.
                  </p>
                  <Button asChild size="sm" className="bg-brand text-brand-foreground hover:bg-brand/90 text-xs">
                    <a href={flowUrl} target="_blank" rel="noopener noreferrer">
                      Open PartyRock App <ArrowUpRight className="size-3.5 ml-1" />
                    </a>
                  </Button>
                </section>
              ) : (
                <section className="p-5 rounded-xl border border-border/60 bg-muted/30 space-y-2">
                  <h3 className="text-xs font-semibold text-foreground">Amazon PartyRock Companion App</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    PartyRock link optional. Set <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">NEXT_PUBLIC_PARTYROCK_FLOW_URL</code> in your environment variables to enable direct one-click launch. The in-app AI Studio above is fully functional right now.
                  </p>
                </section>
              )}
            </div>

            <aside className="space-y-4">
              <section aria-labelledby="copy-heading" className="space-y-4 rounded-xl border border-border bg-card p-5">
                <div>
                  <h2 id="copy-heading" className="text-sm font-semibold text-foreground">
                    Export Raw Prompt Context
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Copy sanitized markdown context to use in any external LLM or AI tool.
                  </p>
                </div>
                <CopyContextPanel opportunities={opportunities} />
              </section>
            </aside>
          </div>
        </div>
      </PageContainer>
    </PageShell>
  );
}
