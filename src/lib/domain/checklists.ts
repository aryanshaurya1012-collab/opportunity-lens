import type { ChecklistItem, OpportunityCategory } from "./types";

const TEMPLATES: Record<OpportunityCategory, string[]> = {
  internship: ["Tailor résumé to the role", "Update GitHub / portfolio links", "Prepare a short cover note", "Submit application"],
  scholarship: ["Collect academic transcripts", "Write personal statement", "Request recommendation letter", "Submit application"],
  hackathon: ["Form or join a team", "Agree on a problem statement", "Register the team", "Prepare demo and pitch"],
  fellowship: ["Draft statement of purpose", "Request references", "Prepare work samples", "Submit application"],
  research: ["Read the lab's recent work", "Write research interest statement", "Request faculty recommendation", "Submit application"],
  grant_competition: ["Draft proposal or entry", "Prepare budget or supporting material", "Review submission rules", "Submit entry"],
  workshop_program: ["Check schedule availability", "Complete registration form", "Prepare prerequisites"],
};

export function defaultChecklist(category: OpportunityCategory): ChecklistItem[] {
  return TEMPLATES[category].map((label, index) => ({ id: `c${index + 1}`, label, done: false }));
}
