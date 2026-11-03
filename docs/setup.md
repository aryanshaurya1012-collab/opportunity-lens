# Setup

## Requirements

- Node.js 22 or later
- npm

No cloud account, database or Docker is needed to run the app in demo mode.

## Local development

```bash
npm install
cp .env.local.example .env.local   # optional; every variable is optional
npm run dev
```

Open <http://localhost:3000>. Click **Create your profile** (or go to `/onboarding`) and use
**Fill with a fictional sample profile** to explore quickly.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm test` | Vitest unit tests (eligibility engine, matching, filters) |
| `npm run db:seed:generate` | Regenerates `supabase/seed.sql` from the demo catalogue |

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | No | Canonical https URL for metadata |
| `NEXT_PUBLIC_PARTYROCK_FLOW_URL` | No | Public https URL of the PartyRock app. Without it, the launch button is shown disabled with an explanation. |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No (P1) | Reserved for the Supabase repository; not used yet |
| `SUPABASE_SERVICE_ROLE_KEY` | No (P1) | Server-only, for admin scripts. Never expose to the browser. |

`NEXT_PUBLIC_*` values are inlined into the client bundle at build time — rebuild after changing them, and
never put secrets in them.

## Deploying to Vercel

1. Import the repository in Vercel (framework preset: Next.js).
2. Optionally set `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_PARTYROCK_FLOW_URL`.
3. Deploy. No other configuration is required for demo mode.

## Preparing Supabase (P1)

The schema is ready but the app does not connect to it yet.

```bash
supabase init            # if you use the Supabase CLI
supabase db reset        # applies supabase/migrations and supabase/seed.sql locally
```

Grant an admin with the service role (SQL editor):

```sql
insert into user_roles (user_id, role) values ('<auth user uuid>', 'admin');
```

## Resetting demo data

Profile → **Reset demo data**, or clear the `opportunitylens:demo:v1` key from the browser's local storage.
