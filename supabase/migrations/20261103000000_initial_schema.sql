-- OpportunityLens initial schema (P1).
-- Mirrors the TypeScript domain model in src/lib/domain/types.ts.
-- Row Level Security is enabled on every table; students can only read and write their own
-- rows, and catalogue writes are restricted to users with the admin role.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type opportunity_category as enum (
  'internship', 'scholarship', 'hackathon', 'fellowship', 'research', 'grant_competition', 'workshop_program'
);
create type location_mode as enum ('remote', 'onsite', 'hybrid');
create type opportunity_status as enum ('draft', 'published', 'unpublished', 'expired');
create type verification_status as enum ('unverified', 'verified', 'needs_reverification', 'source_unreachable');
create type compensation_type as enum ('stipend', 'salary', 'funding', 'prize', 'tuition_waiver', 'none', 'unspecified');
create type degree_level as enum ('diploma', 'undergraduate', 'postgraduate', 'doctoral');
create type grade_scale as enum ('cgpa_10', 'cgpa_4', 'percentage');
create type experience_kind as enum ('project', 'internship', 'work', 'research', 'hackathon', 'volunteer');
create type requirement_kind as enum (
  'degree_level', 'field_of_study', 'academic_year', 'graduation_year', 'min_grade', 'skills',
  'experience', 'location', 'citizenship', 'age', 'other'
);
create type application_status as enum (
  'interested', 'preparing', 'applied', 'under_review', 'interview', 'accepted', 'rejected'
);
create type eligibility_outcome as enum ('meets', 'needs_review', 'does_not_meet');
create type app_role as enum ('admin');

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------------------
create table user_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  role app_role not null,
  granted_at timestamptz not null default now(),
  primary key (user_id, role)
);

-- security definer so policies can call it without granting read access to user_roles.
create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from user_roles where user_id = auth.uid() and role = 'admin');
$$;

-- ---------------------------------------------------------------------------
-- Student profile
-- ---------------------------------------------------------------------------
create table profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  institution text not null default '',
  degree_level degree_level,
  degree text not null default '',
  field_of_study text,
  academic_year smallint check (academic_year between 1 and 7),
  graduation_year smallint check (graduation_year between 1950 and 2100),
  grade_value numeric(6, 2),
  grade_scale grade_scale,
  skills text[] not null default '{}',
  interests text[] not null default '{}',
  preferred_categories opportunity_category[] not null default '{}',
  country text not null default '',
  city text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint grade_value_and_scale check ((grade_value is null) = (grade_scale is null))
);
create trigger profiles_updated_at before update on profiles for each row execute function set_updated_at();

create table profile_experiences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (user_id) on delete cascade,
  kind experience_kind not null,
  title text not null,
  organization text not null default '',
  description text not null default '',
  skills text[] not null default '{}',
  created_at timestamptz not null default now()
);
create index profile_experiences_user_idx on profile_experiences (user_id);

-- Optional, consent-gated details kept apart from the main profile so they can be
-- protected, exported and deleted independently.
create table profile_sensitive_details (
  user_id uuid primary key references profiles (user_id) on delete cascade,
  consent_given_at timestamptz not null,
  date_of_birth date,
  citizenship text,
  updated_at timestamptz not null default now()
);
create trigger profile_sensitive_details_updated_at before update on profile_sensitive_details
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Opportunity catalogue
-- ---------------------------------------------------------------------------
create table opportunities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  provider_name text not null,
  provider_url text check (provider_url is null or provider_url like 'https://%'),
  category opportunity_category not null,
  summary text not null,
  description text not null,
  benefits text[] not null default '{}',
  compensation_type compensation_type not null default 'unspecified',
  compensation_min numeric(14, 2),
  compensation_max numeric(14, 2),
  compensation_currency char(3),
  compensation_period text check (compensation_period in ('month', 'year', 'total')),
  compensation_note text,
  location_mode location_mode not null,
  locations text[] not null default '{}',
  deadline timestamptz,
  is_rolling boolean not null default false,
  start_date timestamptz,
  duration text,
  skills text[] not null default '{}',
  tags text[] not null default '{}',
  application_url text check (application_url is null or application_url like 'https://%'),
  source_url text check (source_url is null or source_url like 'https://%'),
  status opportunity_status not null default 'draft',
  verification_status verification_status not null default 'unverified',
  last_verified_at timestamptz,
  published_at timestamptz,
  is_demo boolean not null default false,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Demo records can never claim to be verified.
  constraint demo_never_verified check (not is_demo or verification_status = 'unverified'),
  constraint verified_has_source check (verification_status <> 'verified' or (source_url is not null and last_verified_at is not null)),
  constraint published_has_date check (status <> 'published' or published_at is not null)
);
create trigger opportunities_updated_at before update on opportunities for each row execute function set_updated_at();
create index opportunities_listing_idx on opportunities (status, category, deadline);
create index opportunities_skills_idx on opportunities using gin (skills);
create index opportunities_tags_idx on opportunities using gin (tags);

create table opportunity_requirements (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references opportunities (id) on delete cascade,
  position smallint not null default 0,
  kind requirement_kind not null,
  mandatory boolean not null default true,
  stated_text text not null,
  -- Kind-specific parameters, e.g. {"levels": ["undergraduate"]} or {"value": 7, "scale": "cgpa_10"}.
  params jsonb not null default '{}'::jsonb,
  unique (opportunity_id, position)
);
create index opportunity_requirements_opportunity_idx on opportunity_requirements (opportunity_id);

create table opportunity_verifications (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references opportunities (id) on delete cascade,
  verified_by uuid references auth.users (id) on delete set null,
  result verification_status not null,
  source_url text,
  notes text not null default '',
  checked_at timestamptz not null default now()
);
create index opportunity_verifications_opportunity_idx on opportunity_verifications (opportunity_id, checked_at desc);

-- ---------------------------------------------------------------------------
-- Student activity
-- ---------------------------------------------------------------------------
create table saved_opportunities (
  user_id uuid not null references auth.users (id) on delete cascade,
  opportunity_id uuid not null references opportunities (id) on delete cascade,
  saved_at timestamptz not null default now(),
  primary key (user_id, opportunity_id)
);

create table applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  opportunity_id uuid not null references opportunities (id) on delete cascade,
  status application_status not null default 'interested',
  personal_deadline date,
  notes text not null default '',
  -- [{"id": "...", "label": "...", "done": false}]
  checklist jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, opportunity_id)
);
create trigger applications_updated_at before update on applications for each row execute function set_updated_at();
create index applications_user_idx on applications (user_id, status);

create table eligibility_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  opportunity_id uuid not null references opportunities (id) on delete cascade,
  outcome eligibility_outcome not null,
  engine text not null,
  -- {"met": n, "not_met": n, "unknown": n, "manual_review": n}
  counts jsonb not null,
  missing_fields text[] not null default '{}',
  evaluated_at timestamptz not null default now()
);
create index eligibility_assessments_user_idx on eligibility_assessments (user_id, opportunity_id, evaluated_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table user_roles enable row level security;
alter table profiles enable row level security;
alter table profile_experiences enable row level security;
alter table profile_sensitive_details enable row level security;
alter table opportunities enable row level security;
alter table opportunity_requirements enable row level security;
alter table opportunity_verifications enable row level security;
alter table saved_opportunities enable row level security;
alter table applications enable row level security;
alter table eligibility_assessments enable row level security;

-- Roles are granted with the service role only; users may see their own roles.
create policy "read own roles" on user_roles for select using (user_id = auth.uid());

create policy "own profile" on profiles for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own experiences" on profile_experiences for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
-- Admins deliberately have no access to sensitive details.
create policy "own sensitive details" on profile_sensitive_details for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "public reads published opportunities" on opportunities for select
  using (status = 'published' or is_admin());
create policy "admins manage opportunities" on opportunities for all
  using (is_admin()) with check (is_admin());

create policy "public reads requirements of published opportunities" on opportunity_requirements for select
  using (exists (
    select 1 from opportunities o where o.id = opportunity_id and (o.status = 'published' or is_admin())
  ));
create policy "admins manage requirements" on opportunity_requirements for all
  using (is_admin()) with check (is_admin());

create policy "admins manage verifications" on opportunity_verifications for all
  using (is_admin()) with check (is_admin());

create policy "own saved" on saved_opportunities for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own applications" on applications for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own assessments" on eligibility_assessments for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
