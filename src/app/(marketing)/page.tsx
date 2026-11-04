import { LandingContent } from "@/components/marketing/landing-content";
import { SAMPLE_PROFILE } from "@/data/sample-profile";
import { getOpportunityRepository } from "@/lib/data";
import { evaluateEligibility } from "@/lib/eligibility";
import { SERVER_REFERENCE_DATE } from "@/lib/domain/reference-date";

export default async function LandingPage() {
  const repository = getOpportunityRepository();
  const preview = await repository.getBySlug("northwind-frontend-engineering-intern");
  const previewResult = preview
    ? evaluateEligibility(SAMPLE_PROFILE, preview, SERVER_REFERENCE_DATE)
    : null;

  return <LandingContent preview={preview} previewResult={previewResult} />;
}
