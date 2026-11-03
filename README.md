# OpportunityLens

**Know if you qualify. Know what to do next.**

OpportunityLens helps students discover internships, scholarships, hackathons, fellowships, research
programmes, grants and competitions, and workshops — and understand, requirement by requirement,
whether they qualify.

> **Demo build.** Every opportunity in this build is fictional sample data, clearly labelled
> **Demo data**, never verified and never linked to a real application. Your profile and progress are
> stored only in your browser.

## Features

- **Discovery** across seven opportunity categories with search, filters and URL-shareable views.
- **Student profile** with a guided onboarding wizard. Optional citizenship and date of birth are collected only with explicit consent.
- **Explainable eligibility engine** with three outcomes — *Meets stated requirements*,
  *Potentially eligible / needs review*, *Does not meet stated requirements* — showing the provider's wording,
  your evidence, missing information and next steps. Missing data is never assumed to pass.
- **Personalised ranking** with reasons for each recommendation.
- **Dashboard, saved items and application tracking** with statuses, personal deadlines, checklists and notes.
- **AI analysis with Amazon PartyRock**: launch our PartyRock app in a new tab, with an optional copyable text
  summary. No data is transferred automatically and no undocumented APIs are used.

## Quick start

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. No accounts, databases or cloud credentials are required. See
[docs/setup.md](docs/setup.md) for environment variables, scripts and deployment.

## Documentation

- [Setup](docs/setup.md)
- [MVP architecture](docs/architecture-mvp.md) — data modes, eligibility engine, matching, AI boundaries
- [Production architecture on AWS](docs/architecture-aws-production.md)
- Database schema (P1): [`supabase/migrations`](supabase/migrations), demo seed: [`supabase/seed.sql`](supabase/seed.sql)

## Tech stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Framer Motion, Lucide, Vitest.
Planned: Supabase (Auth, Postgres, RLS), Amazon Bedrock.

## Roadmap

| Priority | Scope |
| --- | --- |
| P0 (this build) | Landing, discovery, profile and onboarding, eligibility engine and UI, saved items, application tracking, PartyRock integration, AWS architecture |
| P1 | Supabase Auth, persistent Postgres, per-user data with RLS, protected admin for catalogue management and verification |
| P2 | Bedrock analysis, automated discovery, document understanding, notifications, university and company integrations, multi-university |
