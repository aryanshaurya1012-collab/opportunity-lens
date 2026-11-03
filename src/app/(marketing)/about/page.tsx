import type { Metadata } from "next";
import { SITE_TAGLINE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "Why OpportunityLens exists, how it treats data, and how it is built.",
};

const PRINCIPLES = [
  {
    title: "Never fabricate",
    body: "Real listings must link to a verifiable source. Demonstration data is fictional, always labelled, and never shown as verified or currently open.",
  },
  {
    title: "Never assume",
    body: "If your profile doesn't contain the information a requirement needs, the result is “missing information” — not a pass.",
  },
  {
    title: "Show the evidence",
    body: "Every verdict lists the provider's stated requirement, the profile value it was compared with, and the reasoning.",
  },
  {
    title: "Collect the minimum",
    body: "Citizenship and date of birth are optional, consent-gated, and only used for requirements that genuinely need them.",
  },
];

const ARCHITECTURE = [
  { layer: "Web app", now: "Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui", later: "Same, deployed on Vercel or AWS" },
  { layer: "Eligibility", now: "Deterministic rules engine with unit tests", later: "Rules engine + Amazon Bedrock explanations" },
  { layer: "Generative AI", now: "Amazon PartyRock app (linked, user-initiated)", later: "Amazon Bedrock inside the product" },
  { layer: "Data", now: "Typed demo catalogue; profile and progress in browser storage", later: "Supabase Postgres with row-level security, then Aurora/RDS" },
  { layer: "Identity", now: "None required in demo mode", later: "Supabase Auth with role-protected admin" },
];

export default function AboutPage() {
  return (
    <div className="container-page space-y-20 py-14 md:py-20">
      <header className="max-w-3xl space-y-5">
        <p className="text-sm font-medium text-brand">About OpportunityLens</p>
        <h1 className="font-display text-4xl tracking-tight text-navy md:text-6xl">{SITE_TAGLINE}</h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Students miss opportunities not because they aren&apos;t qualified, but because eligibility criteria are
          scattered, dense and inconsistent. OpportunityLens brings internships, scholarships, hackathons,
          fellowships, research programmes, grants and workshops into one model — and explains, transparently,
          where each student stands and what to do next.
        </p>
      </header>

      <section id="data-principles" aria-labelledby="principles-heading" className="scroll-mt-24 space-y-8">
        <h2 id="principles-heading" className="font-display text-3xl tracking-tight text-navy">
          Data principles
        </h2>
        <dl className="grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2">
          {PRINCIPLES.map((principle) => (
            <div key={principle.title} className="space-y-2 bg-card p-6">
              <dt className="font-semibold">{principle.title}</dt>
              <dd className="text-muted-foreground">{principle.body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="architecture" aria-labelledby="architecture-heading" className="scroll-mt-24 space-y-8">
        <div className="max-w-2xl space-y-3">
          <h2 id="architecture-heading" className="font-display text-3xl tracking-tight text-navy">
            How it&apos;s built
          </h2>
          <p className="text-muted-foreground">
            This hackathon build runs entirely without external credentials. The data layer sits behind a repository
            interface so Supabase — and later AWS — can replace the demo provider without changing the UI.
          </p>
        </div>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <caption className="sr-only">Current and planned architecture</caption>
            <thead className="bg-muted/60 text-muted-foreground">
              <tr>
                <th scope="col" className="px-5 py-3 font-medium">Layer</th>
                <th scope="col" className="px-5 py-3 font-medium">Hackathon build</th>
                <th scope="col" className="px-5 py-3 font-medium">Production direction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {ARCHITECTURE.map((row) => (
                <tr key={row.layer}>
                  <th scope="row" className="px-5 py-3.5 font-medium">{row.layer}</th>
                  <td className="px-5 py-3.5 text-muted-foreground">{row.now}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{row.later}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
