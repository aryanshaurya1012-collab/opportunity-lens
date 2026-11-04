import type { Metadata } from "next";
import { PageShell } from "@/components/app-shell/page-shell";
import { Logo } from "@/components/shared/logo";
import { ProfileEditor } from "@/components/profile/profile-editor";
import { getOpportunityRepository } from "@/lib/data";
import { catalogueVocabulary } from "@/lib/domain/vocabulary";

export const metadata: Metadata = { title: "Create your profile" };

export default async function OnboardingPage() {
  const suggestions = catalogueVocabulary(await getOpportunityRepository().listPublished());

  return (
    <PageShell background="fluid">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 md:px-6">
          <Logo href="/" />
          <a
            href="/app"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip to dashboard &rarr;
          </a>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6 md:py-12 space-y-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-wider text-brand uppercase">Student Onboarding</p>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground">
            Build your eligibility profile
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Every field you fill in turns into evidence for eligibility checks. Anything you skip is shown as missing
            information — never assumed.
          </p>
        </div>
        <ProfileEditor mode="wizard" suggestions={suggestions} />
      </main>
    </PageShell>
  );
}
