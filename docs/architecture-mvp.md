# OpportunityLens — MVP architecture (hackathon build)

## Runtime

- **Next.js 16 (App Router)** with Cache Components / Partial Prerendering. Public pages, including every
  opportunity detail page, are prerendered at build time.
- **Two root layouts:** `src/app/(marketing)` (light editorial theme, indexable) and `src/app/(product)`
  (dark workspace, `noindex`). Navigating between them is a full page load by design.
- **Styling:** Tailwind CSS v4 tokens in `src/app/globals.css`, shadcn/ui primitives in `src/components/ui`,
  Framer Motion for small entrance animations (disabled under `prefers-reduced-motion`).

## Data modes

`src/lib/config.ts` exposes `dataMode`. The hackathon build always runs in **demo** mode:

| Data | Demo mode | P1 (Supabase) |
| --- | --- | --- |
| Opportunity catalogue | `src/data/demo-opportunities.ts` (21 fictional records, 3 per category) through `DemoOpportunityRepository` | `opportunities` + `opportunity_requirements` tables via a Supabase repository |
| Profile, saved items, applications, assessments | `localStorage` key `opportunitylens:demo:v1` (`src/lib/user-data/local-store.ts`) | Per-user tables protected by RLS |
| Auth | None — everything stays in the browser | Supabase Auth |

Demo records are always `isDemo: true`, `verificationStatus: "unverified"`, and have no provider, source or
application URLs. Every surface that shows one renders a **Demo data** badge.

Swapping the catalogue source means implementing `OpportunityRepository`
(`src/lib/data/opportunity-repository.ts`) and returning it from `getOpportunityRepository()`. User data goes
through the `UserDataActions` interface (`src/lib/user-data/types.ts`), so a Supabase-backed hook can replace the
local store without touching components.

## Eligibility engine (`src/lib/eligibility`)

A pure, deterministic function: `evaluateEligibility(profile, opportunity, now)`.

- Each requirement gets one of: `met`, `not_met`, `unknown` (profile field missing) or `manual_review`.
- Missing information is never treated as a pass.
- Grades on different scales (for example CGPA vs percentage) are **not** converted; they go to manual review.
- Free-text conditions (`kind: "other"`) always go to manual review.
- Outcome rules, using mandatory requirements only:
  - any `not_met` → **Does not meet stated requirements**
  - otherwise any `unknown` / `manual_review`, or no structured requirements → **Potentially eligible / needs review**
  - otherwise → **Meets stated requirements**
- Every result includes the provider's stated text, the profile evidence used, missing fields and prioritised recommendations.

Tests: `src/lib/eligibility/evaluate.test.ts` (`npm test`).

## Matching (`src/lib/matching`)

`rankOpportunities` scores open listings out of 100 using the eligibility outcome, skill overlap, preferred
categories, interests, location fit and deadline proximity, and returns human-readable reasons. Filters are
synced to the URL (`?q=&category=&mode=&deadline=&paid=&closed=&sort=`).

## AI

- **Rules engine** (on this site): authoritative, explainable.
- **Amazon PartyRock** (`/app/ai-analysis`): an external, public PartyRock app opened in a new tab via
  `NEXT_PUBLIC_PARTYROCK_FLOW_URL`. No data is transferred automatically; the student can copy a
  non-sensitive text summary of their profile and an opportunity, generated in the browser, and paste it in.
  No undocumented PartyRock APIs are used.
- **Amazon Bedrock**: planned (P2), see [architecture-aws-production.md](./architecture-aws-production.md).

## Admin

There is intentionally **no admin interface** in the hackathon build: without authentication it would be
unprotected. Catalogue management arrives with Supabase Auth and the `admin` role in P1.

## Time

Deadlines are time-sensitive but pages are prerendered. Server renders use a fixed reference date
(`src/lib/domain/reference-date.ts`); client components re-render with the real clock via `useNow()`.
