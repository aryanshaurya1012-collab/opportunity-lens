import type { Metadata } from "next";

export const SITE_NAME = "OpportunityLens";
export const SITE_TAGLINE = "Know if you qualify. Know what to do next.";
export const SITE_DESCRIPTION =
  "OpportunityLens helps students discover internships, scholarships, hackathons, fellowships, research programmes, grants and workshops — and see, requirement by requirement, whether they qualify.";

export const baseMetadata: Metadata = {
  title: { default: `${SITE_NAME} — ${SITE_TAGLINE}`, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  icons: { icon: "/logo.svg" },
};
