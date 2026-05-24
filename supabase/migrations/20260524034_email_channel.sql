-- Email channel Tier 2
-- Side tables for per-email RFC-5322 metadata (threading headers, direction).
-- The spine (ai_conversations + ai_conversation_messages) is shared with web chat.

-- email_threads (one row per email conversation chain)
create table if not exists public.email_threads (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,

  subject              text not null,
  -- Normalised subject for fuzzy fallback matching (strip Re:/Fwd: prefixes)
  subject_normalized   text not null,
  -- The very first Message-ID in the chain (anchor for References: header)
  root_message_id      text not null,
  -- Buyer's FROM address for outbound reply
  buyer_email          text not null,

  created_at   timestamptz not null default now()
);

create unique index if not exists idx_email_threads_root_msg
  on public.email_threads(root_message_id);
create index if not exists idx_email_threads_conv
  on public.email_threads(conversation_id);
create index if not exists idx_email_threads_buyer
  on public.email_threads(buyer_email, subject_normalized);

alter table public.email_threads enable row level security;

create policy email_threads_admin_select on public.email_threads
  for select to authenticated
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

revoke insert, update, delete on public.email_threads from anon, authenticated;

-- email_messages (one row per individual email - inbound AND outbound)
create table if not exists public.email_messages (
  id                      uuid primary key default gen_random_uuid(),
  conversation_message_id uuid references public.ai_conversation_messages(id) on delete set null,
  thread_id               uuid not null references public.email_threads(id) on delete cascade,

  direction  text not null check (direction in ('inbound', 'outbound')),

  message_id   text unique,
  in_reply_to  text,
  refs         text[] not null default '{}',

  from_address text not null,
  to_address   text not null,
  subject      text not null,

  dkim_pass  boolean,
  spf_pass   boolean,
  dmarc_pass boolean,

  created_at timestamptz not null default now()
);

create index if not exists idx_email_messages_thread
  on public.email_messages(thread_id, created_at asc);
create index if not exists idx_email_messages_in_reply_to
  on public.email_messages(in_reply_to)
  where in_reply_to is not null;

alter table public.email_messages enable row level security;

create policy email_messages_admin_select on public.email_messages
  for select to authenticated
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

revoke insert, update, delete on public.email_messages from anon, authenticated;
