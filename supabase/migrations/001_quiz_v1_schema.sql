-- AI Church Leadership Quiz v1 schema
-- Applied 2026-05-14 to speakeasy-agent (dquuimhmbofdhdsbdbly).
-- See docs/superpowers/specs/2026-05-14-ai-church-leadership-quiz-design.md

create table if not exists quiz_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id uuid not null,
  responses jsonb not null,
  computed jsonb not null,
  referrer text,
  user_agent_hash text
);

create index if not exists quiz_submissions_archetype_idx on quiz_submissions ((computed->>'archetype'));
create index if not exists quiz_submissions_grade_idx     on quiz_submissions ((computed->>'grade'));
create index if not exists quiz_submissions_session_idx   on quiz_submissions (session_id);
create index if not exists quiz_submissions_created_at_idx on quiz_submissions (created_at desc);

create table if not exists quiz_contacts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  submission_id uuid not null references quiz_submissions(id) on delete cascade,
  email text not null,
  name text,
  role text,
  is_arizona boolean,
  interview_opt_in boolean,
  group_version_opt_in boolean,
  kit_opt_in boolean,
  consent_to_outreach boolean not null default true
);

create index if not exists quiz_contacts_submission_idx on quiz_contacts (submission_id);
create index if not exists quiz_contacts_interview_idx  on quiz_contacts (interview_opt_in) where interview_opt_in = true;
create index if not exists quiz_contacts_arizona_idx    on quiz_contacts (is_arizona) where is_arizona = true;
create index if not exists quiz_contacts_email_idx      on quiz_contacts (email);

create table if not exists quiz_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  event_type text not null,
  created_at timestamptz not null default now(),
  metadata jsonb
);

create index if not exists quiz_events_session_idx on quiz_events (session_id);
create index if not exists quiz_events_type_idx    on quiz_events (event_type, created_at desc);

-- RLS: anon can INSERT only. SELECT/UPDATE/DELETE require service role or dashboard.
-- IMPORTANT: when calling PostgREST from the serverless function, use `Prefer: return=minimal`
-- and generate the UUID server-side. `return=representation` requires a SELECT policy.
alter table quiz_submissions enable row level security;
alter table quiz_contacts    enable row level security;
alter table quiz_events      enable row level security;

create policy "quiz_submissions public insert" on quiz_submissions for insert to public with check (true);
create policy "quiz_contacts public insert"    on quiz_contacts    for insert to public with check (true);
create policy "quiz_events public insert"      on quiz_events      for insert to public with check (true);

grant insert on quiz_submissions to anon;
grant insert on quiz_contacts to anon;
grant insert on quiz_events to anon;

comment on table quiz_submissions is 'AI Church Leadership Quiz — one row per completed quiz. Anon role can INSERT; reads via service role.';
comment on table quiz_contacts    is 'Email opt-ins from quiz result page. Linked to submission. Anon role can INSERT.';
comment on table quiz_events      is 'Funnel event log. Anon role can INSERT.';
