# OpportunityLens

**Know if you qualify. Know what to do next.**

OpportunityLens is an intelligent student opportunity discovery and eligibility intelligence platform. It brings internships, scholarships, hackathons, fellowships, research programmes, grants, competitions, and skill workshops into one unified, explainable model — evaluating student profiles against stated requirements with deterministic clarity and generative AI strategy.

> **Demonstration Build**: Every listing in this build is a structured, fictional demonstration record clearly labelled **Demo data**, never verified, and never linked to live external applications. Candidate profile and progress data are preserved locally in browser storage (`localStorage`). No credentials, cloud accounts, or third-party database connections are required to run or test the full journey.

---

## 1. Problem Statement

Students frequently miss life-changing academic and career opportunities — not because they lack qualification, but because eligibility criteria are:
- **Scattered and Inconsistent**: Criteria are buried across disparate PDFs, blogs, job portals, and institutional bulletins.
- **Ambiguous and Dense**: Complex GPA scales, citizenship caveats, graduation cutoffs, and prerequisite coursework lead to premature self-disqualification or wasted applications.
- **Opaque in Feedback**: Most portals provide a binary rejection with zero explanation of what profile attribute was missing or what concrete steps would achieve eligibility.

---

## 2. Project Vision

OpportunityLens aims to democratize access to high-impact career and educational pathways by replacing opaque application black boxes with **transparent, explainable eligibility intelligence**. By modeling opportunities as structured rules and student backgrounds as verifiable evidence, OpportunityLens empowers learners to identify their fit instantly, address credential gaps proactively, and execute focused applications with confidence.

---

## 3. Solution Overview

OpportunityLens operates a **dual-engine architecture**:
1. **Deterministic Rules Engine**: An explainable, pure TypeScript rules evaluation engine that verifies student profile attributes against provider criteria without guesswork or hallucination. Missing data is flagged as missing — never assumed to pass.
2. **Generative AI Strategy Studio**: In-app AI synthesis that turns raw profile evidence and opportunity requirements into strategic readiness scores, tailored resume impact statements, and custom behavioral/technical interview talking points, supplemented by optional Amazon PartyRock exploratory integration.

---

## 4. Seven Supported Opportunity Categories

| Category | Identifier | Description |
| :--- | :--- | :--- |
| **Internships** | `internship` | Industry placements with stipends, mentorship, and practical engineering/business experience. |
| **Scholarships** | `scholarship` | Merit-based and need-based tuition and stipend grants for undergraduate and postgraduate study. |
| **Hackathons** | `hackathon` | Time-boxed build sprints with prizes, team collaboration, sponsor tracks, and industry visibility. |
| **Fellowships** | `fellowship` | Structured cohorts offering leadership development, stipends, and specialized career acceleration. |
| **Research Programmes** | `research` | Academic lab placements, faculty assistantships, and scientific publications. |
| **Grants & Competitions** | `grant_competition` | Seed funding, venture competitions, design challenges, and venture pitch showcases. |
| **Workshops & Bootcamps** | `workshop_program` | Hands-on skill bootcamps, technical training cohorts, and professional certifications. |

---

## 5. Key Features

- **Catalogue Discovery**: Search, filter, and sort listings across all seven categories with instant URL-synced filters (`?q=`, `?category=`, `?mode=`, `?deadline=`, `?paid=`, `?sort=`).
- **Student Profile & Onboarding Wizard**: Step-by-step onboarding wizard capturing degree levels, fields of study, grading scales (10-point CGPA, 4-point GPA, percentages), skills, interests, and verified project/work experience.
- **Privacy by Design**: Sensitive fields (citizenship and date of birth) are strictly optional and stored only with explicit user consent.
- **Explainable Eligibility Breakdown**: Every listing itemizes provider requirements, compares them with student evidence, and provides clear verdict cards.
- **Personalized Ranking & Matching**: Computes match scores (0–100) using eligibility outcomes, skill overlap, category preferences, and deadline proximity.
- **Application Tracker**: Kanban and list views tracking applications from *Interested* to *Applied*, *Interviewing*, and *Accepted*, with personal deadlines and custom checklists.
- **In-App AI Strategy Studio**: Interactive AI evaluator delivering custom fit scores, resume bullets, and interview prompts for any listing or custom job text.
- **Amazon PartyRock Companion App Integration**: Seamless integration with external Amazon PartyRock flows via sanitized context export.
- **Interactive 3D Visual Experience**: Responsive Three.js ambient space and fluid wireframe backgrounds reacting to scroll velocity and mouse parallax. The dense teal wireframe is isolated strictly to the Profile creation and editing experience, while the 3D rotating earth sphere is isolated to the Landing Hero and Dashboard, with natural document scrolling and `prefers-reduced-motion` compliance.
- **Natural Document Scrolling**: Full accessibility via wheel, touch, trackpad, and keyboard without viewport height constraints, scroll hijacking, or fixed action bar overlapping.
- **Instant Route Transitions**: High-performance client-side navigation with Next.js link prefetching and zero-latency loading skeletons between all product workspace routes.

---

## 6. How the Eligibility Engine Works

The core eligibility engine (`src/lib/eligibility/evaluate.ts`) is a pure, deterministic function:

$$\text{evaluateEligibility}(\text{profile}, \text{opportunity}, \text{referenceDate}) \to \text{EligibilityResult}$$

### Verdict Outcomes (Mandatory Requirements)
1. **Meets stated requirements (`meets`)**: Every mandatory requirement is satisfied by information in the student's profile.
2. **Potentially eligible / needs review (`needs_review`)**: At least one requirement has missing student data or involves subjective conditions requiring human verification.
3. **Does not meet stated requirements (`does_not_meet`)**: At least one mandatory requirement is definitively violated by profile evidence (e.g. GPA below minimum cutoff, graduation year out of range).

### Requirement Statuses
- `met`: The profile strictly satisfies the requirement condition.
- `not_met`: The profile actively fails the criteria (e.g., minimum grade not achieved).
- `unknown`: Required profile field is blank or not yet provided. Missing information is **never** assumed to pass.
- `manual_review`: Condition cannot be validated deterministically (e.g., cross-scale grade conversions, free-text "other" requirements, institutional accreditation checks).

---

## 7. Technology Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) with Turbopack, Cache Components, and Partial Prerendering (PPR).
- **Core Library**: [React 19](https://react.dev/).
- **Language**: [TypeScript 5](https://www.typescriptlang.org/) (strict mode, zero type errors).
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with centralized theme tokens.
- **Component Primitives**: [shadcn/ui](https://ui.shadcn.com/) and [Radix UI](https://www.radix-ui.com/).
- **3D Graphics & Animations**: [Three.js](https://threejs.org/) with container-relative `ResizeObserver` alignment and `framer-motion`.
- **Icons**: [Lucide React](https://lucide.dev/).
- **Testing**: [Vitest 5](https://vitest.dev/) for unit test suites.
- **Deployment**: [Vercel](https://vercel.com/).

---

## 8. Architecture Overview

OpportunityLens implements an intentional **hybrid visual and architectural identity**:
- **Public Marketing Experience** (`src/app/(marketing)`): Light, clean editorial layout (`#fbfbf9`), deep navy typography (`#0b1b32`), vibrant teal accents, and fast static generation.
- **Product Application Experience** (`src/app/(product)`): Dark midnight-slate workspace (`#070d1a`), high-contrast luminous data cards, persistent application shell sidebar, and interactive tools.
- **Onboarding Experience** (`src/app/(product)/onboarding`): Focus-driven wizard inheriting application dark theme tokens and input styling.

```
┌────────────────────────────────────────────────────────┐
│                   Next.js 16 Runtime                   │
├──────────────────────────┬─────────────────────────────┤
│ (marketing) Root Layout  │    (product) Root Layout    │
│  - Light theme (:root)   │     - Dark theme (.dark)    │
│  - Editorial Typography  │     - Workspace Layout      │
│  - Static Prerendered    │     - Application Shell     │
├──────────────────────────┴─────────────────────────────┤
│                 Core Business Logic                    │
│  - Deterministic Eligibility Engine (evaluate.ts)      │
│  - Matching & Ranking Algorithm (rank.ts)              │
│  - In-App AI Synthesis Studio (ai-analysis-studio.tsx) │
│  - Local Data Store & Repositories (local-store.ts)    │
└────────────────────────────────────────────────────────┘
```

---

## 9. Project Folder Structure

```
opportunity-lens/
├── docs/                               # Architectural and deployment documentation
│   ├── architecture-aws-production.md  # Production AWS Bedrock/Aurora design
│   ├── architecture-mvp.md             # Runtime and hackathon MVP design
│   └── setup.md                        # Local development and setup instructions
├── public/                             # Static assets and favicons
├── scripts/                            # Data generation and Supabase seed scripts
├── src/
│   ├── app/
│   │   ├── (marketing)/                # Public marketing route group (Light Theme)
│   │   │   ├── about/page.tsx          # Principles, architecture, and FAQ
│   │   │   ├── opportunities/          # Public opportunity catalogue and detail views
│   │   │   ├── layout.tsx              # Marketing HTML root layout
│   │   │   └── page.tsx                # Landing page server data fetcher
│   │   ├── (product)/                  # Authenticated application workspace (Dark Theme)
│   │   │   ├── app/
│   │   │   │   ├── ai-analysis/        # AI Analysis Studio & PartyRock integration
│   │   │   │   ├── applications/       # Application tracking pipeline
│   │   │   │   ├── eligibility/        # Deep eligibility requirement workbench
│   │   │   │   ├── opportunities/      # Personalized discovery and detail pages
│   │   │   │   ├── profile/            # Profile settings and management
│   │   │   │   ├── saved/              # Bookmarked opportunities
│   │   │   │   ├── layout.tsx          # Application shell wrapper with sidebar
│   │   │   │   └── page.tsx            # Dashboard home overview
│   │   │   ├── onboarding/page.tsx     # Student onboarding wizard
│   │   │   └── layout.tsx              # Product HTML root layout (.dark)
│   │   └── globals.css                 # Theme tokens, utility classes, Tailwind v4
│   ├── components/
│   │   ├── ai/                         # AI Analysis Studio & prompt context generator
│   │   ├── app-shell/                  # Sidebar, page headers, and PageShell
│   │   ├── applications/               # Application tracking kanban and list cards
│   │   ├── dashboard/                  # Dashboard cards and Three.js 3D backgrounds
│   │   ├── eligibility/                # Detailed requirement breakdown components
│   │   ├── marketing/                  # Landing page content, header, and footer
│   │   ├── opportunities/              # Opportunity cards and filtering explorer
│   │   ├── profile/                    # Profile wizard form and tag inputs
│   │   └── ui/                         # shadcn/ui primitives (Button, Card, Dialog, etc.)
│   ├── data/                           # Demonstration catalogue and sample profile data
│   └── lib/                            # Pure domain algorithms, stores, and utilities
│       ├── ai/                         # AI context generators
│       ├── data/                       # Repository interfaces and demo implementations
│       ├── domain/                     # Domain schemas, formatters, and labels
│       ├── eligibility/                # Deterministic rules evaluation engine and unit tests
│       ├── matching/                   # Recommendation scoring and ranking algorithms
│       └── user-data/                  # Browser localStorage client hooks
└── supabase/                           # Migration schemas and seed scripts (P1 roadmap)
```

---

## 10. Installation & Quick Start

### Prerequisites
- Node.js `22.x` or later
- npm `10.x` or later

### Installation
```bash
git clone https://github.com/aryanshaurya1012-collab/opportunity-lens.git
cd opportunity-lens
npm install
```

### Local Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 11. Environment Variable Configuration

Create a `.env.local` file in the root directory (optional in demo mode):

```bash
# Public canonical site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Public URL of the Amazon PartyRock Flow (optional companion app)
NEXT_PUBLIC_PARTYROCK_FLOW_URL=https://partyrock.aws/u/sample/opportunity-lens/flow

# Supabase integration (Reserved for P1 roadmap; not required in Demo mode)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## 12. Verification & Testing Commands

| Script | Command | Purpose |
| :--- | :--- | :--- |
| **Lint** | `npm run lint` | Runs ESLint 9 across all TypeScript and React files |
| **Type Check** | `npm run typecheck` | Executes `tsc --noEmit` across entire project |
| **Unit Tests** | `npm test` | Runs Vitest unit tests for eligibility and ranking |
| **Watch Tests** | `npm run test:watch` | Runs test runner in interactive watch mode |
| **Build** | `npm run build` | Compiles production Next.js application with Turbopack |
| **Start** | `npm run start` | Boots production server locally |

---

## 13. Deploying to Vercel

1. Push your branch to GitHub.
2. In the [Vercel Dashboard](https://vercel.com/), click **Add New Project** and select the `opportunity-lens` repository.
3. Keep the default build settings (`Framework: Next.js`, `Build Command: next build`).
4. (Optional) Set `NEXT_PUBLIC_PARTYROCK_FLOW_URL` in the **Environment Variables** panel if connecting an Amazon PartyRock deployment.
5. Click **Deploy**.

---

## 14. Amazon PartyRock Integration

OpportunityLens includes a companion prototype integration with **Amazon PartyRock**:
- **Navigation**: Accessible directly via `/app/ai-analysis` or through the `#ai-analysis` section on the landing page.
- **Workflow**:
  1. Students select an opportunity or input custom goals.
  2. The in-browser context generator creates a sanitized markdown summary of the student's profile evidence and opportunity requirements.
  3. Sensitive attributes (citizenship and date of birth) are **never** included.
  4. Clicking **Open in Amazon PartyRock** launches the public flow in a separate tab without transmitting data silently or invoking undocumented endpoints.

---

## 15. Current Demo-Mode Boundaries & Limitations

- **Fictional Data**: All 21 opportunity records in this build are fictional sample listings. They are unverified and do not submit applications to real companies.
- **Browser-Local Storage**: Student profiles, saved listings, and application stages persist inside the browser (`localStorage`). Clearing browser cache resets local state.
- **No External Authentication**: Demo mode does not require accounts or passwords; multiple profiles can be evaluated on the same machine.

---

## 16. Future Roadmap

| Phase | Milestone | Scope |
| :--- | :--- | :--- |
| **P0 (Current)** | Hackathon Release | Full discovery, profile onboarding, deterministic rules engine, interactive AI studio, application tracker, PartyRock export, Three.js scroll system. |
| **P1** | Cloud Persistence | Supabase Auth integration, PostgreSQL with Row-Level Security (RLS), verified administrative listing approval pipeline. |
| **P2** | Production Scale on AWS | Amazon Bedrock document parsing, automated institutional feed scrapers, university single sign-on (SSO), and real-time email deadline alerts. |

---

## 17. Hackathon Context

OpportunityLens was conceptualized and engineered for the **Gen AI Hackathon**. It demonstrates how deterministic rule validation and generative AI guidance can combine into an accessible, ethical, and explainable tool that helps students navigate higher education and career development opportunities.
