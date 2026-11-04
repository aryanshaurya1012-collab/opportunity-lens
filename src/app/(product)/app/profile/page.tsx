import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/app-shell/page-header";
import { FluidBackground } from "@/components/dashboard/fluid-background";
import { ProfileEditor } from "@/components/profile/profile-editor";
import { ResetDemoData } from "@/components/profile/reset-demo-data";
import { getOpportunityRepository } from "@/lib/data";
import { catalogueVocabulary } from "@/lib/domain/vocabulary";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const suggestions = catalogueVocabulary(await getOpportunityRepository().listPublished());

  return (
    <div className="relative min-h-svh w-full">
      {/* Isolated teal wireframe background strictly for the Profile experience */}
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
        aria-hidden="true"
      >
        <div className="sticky top-0 h-svh w-full overflow-hidden">
          <FluidBackground />
        </div>
      </div>

      {/* Main interactive form container above background */}
      <PageContainer className="relative z-10 max-w-4xl pb-16">
        <PageHeader
          eyebrow="Profile"
          title="Your eligibility profile"
          description="Kept up to date, this is what every eligibility check and recommendation is based on."
        />
        <ProfileEditor mode="edit" suggestions={suggestions} />
        <ResetDemoData />
      </PageContainer>
    </div>
  );
}
