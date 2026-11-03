import { ArrowUpRight, Cpu, ExternalLink, Info, ShieldCheck, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/app-shell/page-header";
import { CopyContextPanel } from "@/components/ai/copy-context-panel";
import { Button } from "@/components/ui/button";
import { publicConfig } from "@/lib/config";
import { getOpportunityRepository } from "@/lib/data";

export const metadata: Metadata = { title: "AI analysis" };

const STEPS = [
  "Optionally copy your profile and an opportunity below — this happens only when you press the button.",
  "Open the OpportunityLens app on Amazon PartyRock. It opens in a new tab.",
  "Paste the text into the PartyRock app's inputs and run it.",
  "Treat the output as guidance: check every claim against the original listing.",
];

export default async function AiAnalysisPage() {
  const flowUrl = publicConfig.partyRockFlowUrl;
  const opportunities = await getOpportunityRepository().listPublished();

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Generative AI"
        title="AI analysis with Amazon PartyRock"
        description="Our PartyRock app is the generative AI prototype of OpportunityLens. Use it to get AI-written analysis of an opportunity against your background, alongside the deterministic checks on this site."
      />

      <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
        <div className="space-y-8">
          <section aria-labelledby="launch-heading" className="space-y-5 rounded-lg border border-brand/30 bg-brand-soft p-6">
            <div className="flex items-center gap-2.5">
              <Sparkles aria-hidden className="size-5 text-brand" />
              <h2 id="launch-heading" className="text-lg font-semibold">
                Launch the PartyRock app
              </h2>
            </div>
            <p className="text-sm text-foreground/85">
              You&apos;ll be taken to <strong>partyrock.aws</strong>, an Amazon service with its own terms and sign-in.
              Your OpportunityLens profile, saved items and any documents are <strong>not</strong> sent there
              automatically — you choose what to paste in.
            </p>
            {flowUrl ? (
              <Button asChild size="lg" className="h-11 px-5">
                <a href={flowUrl} target="_blank" rel="noopener noreferrer">
                  Open PartyRock app <ArrowUpRight data-icon="inline-end" />
                  <span className="sr-only">(opens partyrock.aws in a new tab)</span>
                </a>
              </Button>
            ) : (
              <div className="space-y-2">
                <Button size="lg" className="h-11 px-5" disabled>
                  PartyRock link not configured
                </Button>
                <p className="text-xs text-muted-foreground">
                  Set <code className="rounded bg-muted px-1">NEXT_PUBLIC_PARTYROCK_FLOW_URL</code> to the public https
                  URL of the PartyRock app and rebuild.
                </p>
              </div>
            )}
          </section>

          <section aria-labelledby="how-heading" className="space-y-4">
            <h2 id="how-heading" className="font-semibold">
              How to use it
            </h2>
            <ol className="space-y-3">
              {STEPS.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border text-xs tabular-nums">
                    {index + 1}
                  </span>
                  <span className="pt-0.5 text-foreground/85">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="compare-heading" className="space-y-3">
            <h2 id="compare-heading" className="font-semibold">
              How AI analysis fits in
            </h2>
            <dl className="divide-y divide-border rounded-lg border border-border bg-card text-sm">
              <div className="grid gap-1 p-4 sm:grid-cols-[11rem_1fr]">
                <dt className="flex items-center gap-2 font-medium">
                  <ShieldCheck aria-hidden className="size-4 text-brand" /> Eligibility engine
                </dt>
                <dd className="text-muted-foreground">
                  Runs on this site. Deterministic, explainable, requirement-by-requirement. Never guesses.
                </dd>
              </div>
              <div className="grid gap-1 p-4 sm:grid-cols-[11rem_1fr]">
                <dt className="flex items-center gap-2 font-medium">
                  <Sparkles aria-hidden className="size-4 text-brand" /> PartyRock app
                </dt>
                <dd className="text-muted-foreground">
                  Hackathon prototype on Amazon PartyRock. Generative, open-ended analysis of the text you provide.
                </dd>
              </div>
              <div className="grid gap-1 p-4 sm:grid-cols-[11rem_1fr]">
                <dt className="flex items-center gap-2 font-medium">
                  <Cpu aria-hidden className="size-4 text-muted-foreground" /> Amazon Bedrock
                </dt>
                <dd className="text-muted-foreground">
                  Planned. Brings generative analysis and document understanding inside OpportunityLens, grounded in
                  your saved profile.
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <aside className="space-y-6">
          <section aria-labelledby="copy-heading" className="space-y-4 rounded-lg border border-border bg-card p-5">
            <div>
              <h2 id="copy-heading" className="font-semibold">
                Prepare text to paste
              </h2>
              <p className="text-sm text-muted-foreground">
                Generated in your browser from your profile. Nothing is uploaded.
              </p>
            </div>
            <CopyContextPanel opportunities={opportunities} />
          </section>
          <div className="flex gap-3 rounded-lg border border-border p-4 text-sm text-muted-foreground">
            <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
            <p>
              AI-generated output can be incomplete or wrong. Eligibility decisions are always made by the provider —
              confirm on the original listing.{" "}
              <a href="/about#architecture" className="inline-flex items-center gap-1 text-brand hover:underline">
                Architecture <ExternalLink aria-hidden className="size-3" />
              </a>
            </p>
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}
