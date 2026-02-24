create table public.event_participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  registered_at timestamptz not null default now(),
  unique(event_id, user_id)
);

alter table public.event_participants enable row level security;

create policy "Users can view participants"
  on public.event_participants for select using (true);

create policy "Users can register themselves"
  on public.event_participants for insert with check (auth.uid() = user_id);

create policy "Users can unregister themselves"
  on public.event_participants for delete using (auth.uid() = user_id);

create index idx_event_participants_event_id on public.event_participants(event_id);
create index idx_event_participants_user_id on public.event_participants(user_id);
