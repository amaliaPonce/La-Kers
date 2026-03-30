create table if not exists public.communication_conversations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
  owner_id text not null,
  scope_type text not null check (scope_type in ('GENERAL', 'PROPERTY', 'LEASE')),
  unit_id uuid references public.units(id) on delete set null,
  lease_id uuid references public.tenant_persons(id) on delete set null,
  category text not null check (
    category in ('INCIDENCE', 'PAYMENT', 'CONTRACT', 'MAINTENANCE', 'DOCUMENTATION', 'GENERAL_NOTICE', 'QUESTION', 'URGENT')
  ),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  status text not null default 'OPEN' check (status in ('OPEN', 'CLOSED')),
  subject text not null,
  opened_by_actor_type text not null check (opened_by_actor_type in ('OWNER', 'TENANT', 'ADMIN', 'SYSTEM')),
  opened_by_actor_ref text not null,
  closed_at timestamptz,
  closed_by_actor_type text,
  closed_by_actor_ref text,
  reopened_at timestamptz,
  reopened_by_actor_type text,
  reopened_by_actor_ref text,
  last_message_at timestamptz,
  last_message_preview text,
  last_message_author_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint communication_conversations_scope_check check (
    (scope_type = 'GENERAL' and unit_id is null and lease_id is null)
    or (scope_type = 'PROPERTY' and unit_id is not null)
    or (scope_type = 'LEASE' and unit_id is not null and lease_id is not null)
  )
);

create index if not exists communication_conversations_owner_id_idx on public.communication_conversations(owner_id);
create index if not exists communication_conversations_status_idx on public.communication_conversations(status);
create index if not exists communication_conversations_category_idx on public.communication_conversations(category);
create index if not exists communication_conversations_priority_idx on public.communication_conversations(priority);
create index if not exists communication_conversations_unit_id_idx on public.communication_conversations(unit_id);
create index if not exists communication_conversations_lease_id_idx on public.communication_conversations(lease_id);
create index if not exists communication_conversations_last_message_at_idx on public.communication_conversations(last_message_at desc nulls last);

create table if not exists public.communication_conversation_participants (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.communication_conversations(id) on delete cascade,
  actor_type text not null check (actor_type in ('OWNER', 'TENANT', 'ADMIN', 'SYSTEM')),
  actor_ref text not null,
  tenant_person_id uuid references public.tenant_persons(id) on delete set null,
  display_name text not null,
  participant_role text not null check (participant_role in ('OWNER', 'TENANT', 'ADMIN', 'WATCHER')),
  can_read boolean not null default true,
  can_write boolean not null default true,
  can_close boolean not null default false,
  notification_email text,
  last_read_message_id uuid,
  last_read_at timestamptz,
  created_at timestamptz not null default now(),
  unique (conversation_id, actor_type, actor_ref)
);

create index if not exists communication_participants_conversation_idx on public.communication_conversation_participants(conversation_id);
create index if not exists communication_participants_actor_idx on public.communication_conversation_participants(actor_type, actor_ref);
create index if not exists communication_participants_tenant_idx on public.communication_conversation_participants(tenant_person_id);

create table if not exists public.communication_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.communication_conversations(id) on delete cascade,
  sender_participant_id uuid not null references public.communication_conversation_participants(id) on delete restrict,
  message_type text not null default 'USER' check (message_type in ('USER', 'SYSTEM', 'NOTE')),
  visibility text not null default 'EXTERNAL' check (visibility in ('EXTERNAL', 'INTERNAL')),
  body text not null,
  body_format text not null default 'plain_text' check (body_format in ('plain_text')),
  category text check (
    category is null or category in ('INCIDENCE', 'PAYMENT', 'CONTRACT', 'MAINTENANCE', 'DOCUMENTATION', 'GENERAL_NOTICE', 'QUESTION', 'URGENT')
  ),
  priority text check (priority is null or priority in ('low', 'normal', 'high', 'urgent')),
  metadata jsonb,
  edited_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists communication_messages_conversation_idx on public.communication_messages(conversation_id, created_at desc);
create index if not exists communication_messages_sender_idx on public.communication_messages(sender_participant_id);
create index if not exists communication_messages_visibility_idx on public.communication_messages(visibility);
create index if not exists communication_messages_priority_idx on public.communication_messages(priority);

alter table public.communication_conversation_participants
  add constraint communication_participants_last_read_fk
  foreign key (last_read_message_id) references public.communication_messages(id) on delete set null;

create table if not exists public.communication_message_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.communication_messages(id) on delete cascade,
  attachment_type text not null check (attachment_type in ('FILE', 'LINK', 'DOCUMENT')),
  name text not null,
  mime_type text,
  storage_path text,
  url text not null,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  checksum text,
  created_at timestamptz not null default now()
);

create index if not exists communication_message_attachments_message_idx on public.communication_message_attachments(message_id);
create index if not exists communication_message_attachments_type_idx on public.communication_message_attachments(attachment_type);

create table if not exists public.communication_message_reads (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.communication_messages(id) on delete cascade,
  participant_id uuid not null references public.communication_conversation_participants(id) on delete cascade,
  read_at timestamptz not null default now(),
  unique (message_id, participant_id)
);

create index if not exists communication_message_reads_message_idx on public.communication_message_reads(message_id);
create index if not exists communication_message_reads_participant_idx on public.communication_message_reads(participant_id, read_at desc);

create table if not exists public.communication_notifications (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null,
  conversation_id uuid references public.communication_conversations(id) on delete cascade,
  message_id uuid references public.communication_messages(id) on delete cascade,
  recipient_actor_type text not null check (recipient_actor_type in ('OWNER', 'TENANT', 'ADMIN', 'SYSTEM')),
  recipient_actor_ref text not null,
  channel text not null check (channel in ('IN_APP', 'EMAIL')),
  notification_type text not null check (
    notification_type in ('NEW_CONVERSATION', 'NEW_MESSAGE', 'URGENT_MESSAGE', 'REMINDER', 'CONVERSATION_REOPENED', 'CONVERSATION_CLOSED')
  ),
  status text not null default 'PENDING' check (status in ('PENDING', 'SENT', 'READ', 'FAILED', 'CANCELED')),
  title text not null,
  body text not null,
  dedupe_key text,
  scheduled_at timestamptz,
  sent_at timestamptz,
  read_at timestamptz,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists communication_notifications_owner_idx on public.communication_notifications(owner_id, created_at desc);
create index if not exists communication_notifications_recipient_idx on public.communication_notifications(recipient_actor_type, recipient_actor_ref, status);
create unique index if not exists communication_notifications_dedupe_key_idx on public.communication_notifications(dedupe_key) where dedupe_key is not null;

create table if not exists public.communication_settings (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null,
  actor_type text not null check (actor_type in ('OWNER', 'TENANT', 'ADMIN')),
  actor_ref text not null,
  email_enabled boolean not null default true,
  urgent_email_enabled boolean not null default true,
  digest_enabled boolean not null default false,
  digest_frequency text not null default 'daily' check (digest_frequency in ('instant', 'daily', 'weekly')),
  quiet_hours_start time,
  quiet_hours_end time,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, actor_type, actor_ref)
);

create index if not exists communication_settings_owner_idx on public.communication_settings(owner_id);

create table if not exists public.communication_audit_log (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null,
  conversation_id uuid references public.communication_conversations(id) on delete cascade,
  message_id uuid references public.communication_messages(id) on delete cascade,
  actor_type text not null check (actor_type in ('OWNER', 'TENANT', 'ADMIN', 'SYSTEM')),
  actor_ref text not null,
  action text not null check (
    action in (
      'CONVERSATION_CREATED',
      'MESSAGE_SENT',
      'MESSAGE_READ',
      'CONVERSATION_CLOSED',
      'CONVERSATION_REOPENED',
      'ATTACHMENT_ADDED',
      'NOTIFICATION_CREATED'
    )
  ),
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists communication_audit_log_owner_idx on public.communication_audit_log(owner_id, created_at desc);
create index if not exists communication_audit_log_conversation_idx on public.communication_audit_log(conversation_id, created_at desc);
