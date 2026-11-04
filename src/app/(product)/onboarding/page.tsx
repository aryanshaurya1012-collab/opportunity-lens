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
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 md:px-6 md:py-14">
        <header className="border-b border-border/50">
          <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 md:px-6">
            <Logo href="/" />
            <a href="/app" className="text-sm text-muted-foreground hover:text-foreground">
              Skip to dashboard
            </a>
          </div>
        </header>
        <main id="main" className="relative z-10 space-y-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl text-gradient">
              Build your eligibility profile
            </h1>
            <p className="text-muted-foreground">
              Every field you fill in turns into evidence for eligibility checks. Anything you skip is shown as missing
              information — never assumed.
            </p>
          </div>
          <ProfileEditor mode="wizard" suggestions={suggestions} />
        </main>
      </div>
    </PageShell>
  );
}
