import type { Metadata } from "next";
import { PageShell } from "@/components/app-shell/page-shell";
import { PageContainer, PageHeader } from "@/components/app-shell/page-header";
import { ProfileEditor } from "@/components/profile/profile-editor";
import { ResetDemoData } from "@/components/profile/reset-demo-data";
import { getOpportunityRepository } from "@/lib/data";
import { catalogueVocabulary } from "@/lib/domain/vocabulary";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const suggestions = catalogueVocabulary(await getOpportunityRepository().listPublished());

  return (
    <PageShell background="fluid">
      <PageContainer className="max-w-4xl">
        <PageHeader
          eyebrow="Profile"
          title="Your eligibility profile"
          description="Kept up to date, this is what every eligibility check and recommendation is based on."
        />
        <ProfileEditor mode="edit" suggestions={suggestions} />
        <ResetDemoData />
      </PageContainer>
    </PageShell>
  );
}
