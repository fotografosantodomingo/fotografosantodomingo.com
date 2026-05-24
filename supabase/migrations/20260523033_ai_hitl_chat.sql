-- AI HITL Chat — Tier 1 (web chat)
-- Single-tenant adaptation: no org_id / organizations FK.
-- All writes go through service-role; anon/authenticated cannot insert.

-- ─────────────────────────────────────────────
-- ai_conversations (one row per buyer session)
-- ─────────────────────────────────────────────
create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),

  channel text not null default 'web_chat'
    check (channel in ('web_chat', 'email', 'whatsapp', 'voice')),
  status text not null default 'open'
    check (status in ('open', 'escalated', 'resolved', 'abandoned')),

  -- Anon buyer identity (progressively enriched)
  buyer_session_token text not null,
  buyer_email text,
  buyer_phone text,
  buyer_locale text not null default 'es',

  first_message_at timestamptz not null default now(),
  last_message_at  timestamptz not null default now(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_ai_conv_session on public.ai_conversations(buyer_session_token);
create index if not exists idx_ai_conv_status  on public.ai_conversations(status, last_message_at desc);

alter table public.ai_conversations enable row level security;

-- Admins can read all
create policy ai_conv_admin_select on public.ai_conversations
  for select to authenticated
  using (
    exists (select 1 from public.admin_users where user_id = auth.uid())
  );

-- No direct insert/update/delete from client — service-role only
revoke insert, update, delete on public.ai_conversations from anon, authenticated;

-- ──────────────────────────────────────────────────────
-- ai_conversation_messages (spine — every turn goes here)
-- ──────────────────────────────────────────────────────
create table if not exists public.ai_conversation_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,

  role    text not null check (role in ('user', 'assistant', 'system', 'tool')),
  channel text not null default 'web_chat'
    check (channel in ('web_chat', 'email', 'whatsapp', 'voice')),

  body         text not null,
  edited_body  text,  -- operator override; poll returns this instead of body

  -- HITL gate
  approval_status text not null default 'pending'
    check (approval_status in ('pending', 'approved', 'edited', 'rejected', 'auto_sent')),
  approved_by  uuid references public.admin_users(user_id) on delete set null,
  approved_at  timestamptz,
  sent_at      timestamptz,  -- null = not yet delivered to buyer

  -- Classification (heuristic, no second LLM call)
  confidence   numeric(4,3),
  intent       text,
  risk_flags   text[] not null default '{}',

  created_at   timestamptz not null default now()
);

create index if not exists idx_ai_msg_conv_created on public.ai_conversation_messages(conversation_id, created_at asc);
create index if not exists idx_ai_msg_pending on public.ai_conversation_messages(approval_status, created_at desc)
  where approval_status = 'pending';

alter table public.ai_conversation_messages enable row level security;

create policy ai_msg_admin_select on public.ai_conversation_messages
  for select to authenticated
  using (
    exists (select 1 from public.admin_users where user_id = auth.uid())
  );

revoke insert, update, delete on public.ai_conversation_messages from anon, authenticated;

-- ──────────────────────────────────────────────────────
-- ai_conversation_events (funnel checkpoints)
-- ──────────────────────────────────────────────────────
create table if not exists public.ai_conversation_events (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  kind            text not null,  -- started | message_user | draft_pending | approved | edited | rejected | escalated
  payload         jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists idx_ai_events_conv on public.ai_conversation_events(conversation_id, created_at asc);
create index if not exists idx_ai_events_kind  on public.ai_conversation_events(kind, created_at desc);

alter table public.ai_conversation_events enable row level security;

create policy ai_events_admin_select on public.ai_conversation_events
  for select to authenticated
  using (
    exists (select 1 from public.admin_users where user_id = auth.uid())
  );

revoke insert, update, delete on public.ai_conversation_events from anon, authenticated;

-- ──────────────────────────────────────────────────────
-- ai_generation_log (per-LLM-call cost tracking)
-- ──────────────────────────────────────────────────────
create table if not exists public.ai_generation_log (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.ai_conversations(id) on delete set null,
  purpose         text not null,  -- 'chat_draft'
  model           text not null,
  input_tokens    integer not null default 0,
  output_tokens   integer not null default 0,
  estimated_cost_cents numeric(8,4) not null default 0,
  latency_ms      integer,
  created_at      timestamptz not null default now()
);

alter table public.ai_generation_log enable row level security;

create policy ai_gen_log_admin_select on public.ai_generation_log
  for select to authenticated
  using (
    exists (select 1 from public.admin_users where user_id = auth.uid())
  );

revoke insert, update, delete on public.ai_generation_log from anon, authenticated;
