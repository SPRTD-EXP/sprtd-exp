-- ============================================================
-- SPRTD Initial Schema
-- ============================================================

-- profiles
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  full_name text,
  role text not null default 'community' check (role in ('community', 'roster', 'admin')),
  niche text,
  qimah_balance integer not null default 0,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- locations
create table public.locations (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  niche text not null,
  address text,
  lat numeric not null,
  lng numeric not null,
  checkin_radius_meters integer not null default 150,
  qimah_per_checkin integer not null default 50,
  roster_member_id uuid references public.profiles(id),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- events
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  niche text not null,
  location_id uuid references public.locations(id),
  host_id uuid references public.profiles(id),
  date timestamptz not null,
  status text not null default 'upcoming' check (status in ('upcoming', 'live', 'completed')),
  qimah_participation integer not null default 100,
  qimah_winner integer not null default 500,
  max_participants integer,
  season integer not null,
  created_at timestamptz not null default now()
);

-- transactions
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  amount integer not null,
  action_type text not null check (action_type in (
    'event_win', 'event_participation', 'purchase', 'checkin',
    'haybah_unlock', 'roster_challenge', 'roster_apply', 'nomination'
  )),
  reference_id uuid,
  created_at timestamptz not null default now()
);

-- checkins
create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  location_id uuid not null references public.locations(id),
  qimah_earned integer not null,
  created_at timestamptz not null default now()
);

-- roster_members
create table public.roster_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id),
  niche text not null,
  active boolean not null default true,
  challenged boolean not null default false,
  monthly_qimah integer not null default 200,
  joined_at timestamptz not null default now()
);

-- haybah_items
create table public.haybah_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  qimah_required integer not null,
  quantity_total integer not null,
  quantity_remaining integer not null,
  season integer,
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- haybah_unlocks
create table public.haybah_unlocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  item_id uuid not null references public.haybah_items(id),
  unlocked_at timestamptz not null default now(),
  purchased boolean not null default false
);

-- roster_challenges
create table public.roster_challenges (
  id uuid primary key default gen_random_uuid(),
  challenger_id uuid not null references public.profiles(id),
  defender_id uuid not null references public.profiles(id),
  niche text not null,
  qimah_staked integer not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'completed')),
  winner_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.locations enable row level security;
alter table public.events enable row level security;
alter table public.transactions enable row level security;
alter table public.checkins enable row level security;
alter table public.roster_members enable row level security;
alter table public.haybah_items enable row level security;
alter table public.haybah_unlocks enable row level security;
alter table public.roster_challenges enable row level security;

-- profiles
create policy "Users can view all profiles"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Profile created on signup"
  on public.profiles for insert with check (auth.uid() = id);

-- locations
create policy "Anyone can view active locations"
  on public.locations for select using (active = true);

create policy "Admins can manage locations"
  on public.locations for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- events
create policy "Anyone can view events"
  on public.events for select using (true);

create policy "Admins can manage events"
  on public.events for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- transactions (read own only; insert via edge functions only)
create policy "Users can view own transactions"
  on public.transactions for select using (auth.uid() = user_id);

-- checkins (read own only; insert via edge functions only)
create policy "Users can view own checkins"
  on public.checkins for select using (auth.uid() = user_id);

-- roster_members
create policy "Anyone can view roster members"
  on public.roster_members for select using (true);

create policy "Admins can manage roster"
  on public.roster_members for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- haybah_items
create policy "Anyone can view active haybah items"
  on public.haybah_items for select using (active = true);

create policy "Admins can manage haybah items"
  on public.haybah_items for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- haybah_unlocks
create policy "Users can view own unlocks"
  on public.haybah_unlocks for select using (auth.uid() = user_id);

-- roster_challenges
create policy "Anyone can view all challenges"
  on public.roster_challenges for select using (true);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_transactions_user_id on public.transactions(user_id);
create index idx_checkins_user_id on public.checkins(user_id);
create index idx_checkins_location_id on public.checkins(location_id);
create index idx_events_niche on public.events(niche);
create index idx_events_status on public.events(status);
create index idx_locations_niche on public.locations(niche);
create index idx_roster_members_niche on public.roster_members(niche);
