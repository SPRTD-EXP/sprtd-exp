# SPRTD APP — CLAUDE.md

## WHAT SPRTD IS

SPRTD (pronounced "spirited") is a movement first, clothing brand second. The ecosystem is built on earned exclusivity — status and access are achieved through competition and community participation, never through money alone. The brand blends streetwear with Lebanese and Palestinian Arabic cultural heritage, targeting 17-28 year olds. Every decision in this app should reinforce that showing up, competing, and engaging is how you earn your place in SPRTD.

The three pillars of SPRTD:
- **SPRTD.shop** — the clothing. CORE line (accessible essentials) and HAYBAH line (exclusive Arabic-inspired designer pieces)
- **SPRTD.live** — competitive events across seven niches: football, soccer, gym, barber, cars, modeling, photography
- **SPRTD.movement** — roster members (faces of each niche) and partner locations (businesses where passions are cultivated)

---

## TECH STACK

```
Framework:        React Native with Expo (managed workflow)
Router:           expo-router (file-based routing)
Backend:          Supabase (PostgreSQL + Auth + Realtime)
Location:         expo-location (geofencing for check-ins)
Notifications:    expo-notifications (push alerts)
Language:         TypeScript throughout — no JavaScript files
Package manager:  Use `npx expo install` for all native packages
```

---


Never hardcode keys. Never expose the Supabase secret key in the app under any circumstance.

---

## DATABASE SCHEMA

### profiles
```sql
id uuid references auth.users primary key
username text unique not null
full_name text
role text default 'community' -- 'community' | 'roster' | 'admin'
niche text -- only set for roster members
qimah_balance integer default 0
avatar_url text
created_at timestamptz default now()
```

### transactions
```sql
id uuid primary key default gen_random_uuid()
user_id uuid references profiles(id)
amount integer not null -- positive = earn, negative = spend
action_type text not null -- 'event_win' | 'event_participation' | 'purchase' | 'checkin' | 'haybah_unlock' | 'roster_challenge' | 'roster_apply' | 'nomination'
reference_id uuid -- optional: links to event_id, location_id, etc.
created_at timestamptz default now()
```

### events
```sql
id uuid primary key default gen_random_uuid()
title text not null
niche text not null
location_id uuid references locations(id)
host_id uuid references profiles(id) -- roster member hosting
date timestamptz not null
status text default 'upcoming' -- 'upcoming' | 'live' | 'completed'
qimah_participation integer default 100
qimah_winner integer default 500
max_participants integer
season integer not null
created_at timestamptz default now()
```

### locations
```sql
id uuid primary key default gen_random_uuid()
business_name text not null
niche text not null
address text
lat numeric not null
lng numeric not null
checkin_radius_meters integer default 150
qimah_per_checkin integer default 50
roster_member_id uuid references profiles(id)
active boolean default true
created_at timestamptz default now()
```

### roster_members
```sql
id uuid primary key default gen_random_uuid()
user_id uuid references profiles(id) unique
niche text not null
active boolean default true
challenged boolean default false
monthly_qimah integer default 200
joined_at timestamptz default now()
```

### checkins
```sql
id uuid primary key default gen_random_uuid()
user_id uuid references profiles(id)
location_id uuid references locations(id)
qimah_earned integer not null
created_at timestamptz default now()
```

### haybah_items
```sql
id uuid primary key default gen_random_uuid()
name text not null
description text
qimah_required integer not null
quantity_total integer not null
quantity_remaining integer not null
season integer
image_url text
active boolean default true
created_at timestamptz default now()
```

### haybah_unlocks
```sql
id uuid primary key default gen_random_uuid()
user_id uuid references profiles(id)
item_id uuid references haybah_items(id)
unlocked_at timestamptz default now()
purchased boolean default false
```

### roster_challenges
```sql
id uuid primary key default gen_random_uuid()
challenger_id uuid references profiles(id)
defender_id uuid references profiles(id)
niche text not null
qimah_staked integer not null
status text default 'pending' -- 'pending' | 'accepted' | 'completed'
winner_id uuid references profiles(id)
created_at timestamptz default now()
```

---

## ROW LEVEL SECURITY

RLS must be enabled on every table. General rules:
- Users can only read/write their own profile data
- Transactions are insert-only from server-side logic — users cannot manually create transactions
- Qimah balance updates always go through server-side Supabase Edge Functions, never directly from the client
- Admin role bypasses RLS for management operations
- Checkins are validated server-side against geofence before being written

---

## ROUTING STRUCTURE

```
app/
├── (auth)/
│   ├── login.tsx
│   └── signup.tsx
├── (tabs)/
│   ├── _layout.tsx        -- bottom tab navigator
│   ├── index.tsx          -- Home screen
│   ├── events.tsx         -- Events feed
│   ├── locations.tsx      -- Partner locations map
│   └── profile.tsx        -- User profile + Qimah
├── events/
│   └── [id].tsx           -- Single event detail
├── locations/
│   └── [id].tsx           -- Single location detail
├── roster/
│   ├── index.tsx          -- All roster members
│   ├── [niche].tsx        -- Niche roster page
│   └── [niche]/[member].tsx -- Individual roster member
├── haybah/
│   ├── index.tsx          -- HAYBAH drop browser
│   └── [id].tsx           -- Single HAYBAH item
└── _layout.tsx            -- Root layout with auth gate
```

---

## FOLDER STRUCTURE

```
/app          -- all screens via expo-router
/components   -- reusable UI components
  /ui         -- base elements (DiamondButton, NicheTag, etc.)
  /cards      -- QimahCard, EventCard, LocationCard, RosterCard
  /animations -- KufiyahWeave, DiamondPulse, CheckinFlash
/lib
  supabase.ts -- Supabase client initialization
  qimah.ts    -- all Qimah transaction logic (server-side calls only)
/hooks
  useAuth.ts
  useQimah.ts
  useLocation.ts
  useCheckin.ts
/types
  index.ts    -- all TypeScript interfaces
/constants
  colors.ts
  niches.ts
  config.ts
```

---

## DESIGN SYSTEM

### Colors
```ts
const colors = {

    
  background:    '#3f3b31'
  card:          '#2E2B23'  — slightly darker than bg for card elevation
  accent:        '#ffe285'  — primary gold
  accentMuted:   '#a79e76'  — secondary warm khaki
  textPrimary:   '#F0F0EB'
  textSecondary: '#8C8C87'
  border:        '#4a4740'
  success:        '#4CAF50', // Qimah earned
  error:          '#C0392B', // Qimah spent / challenged
  // Niche colors
  niches: {
    football:    '#2E4A1E',
    soccer:      '#1A3A2A',
    gym:         '#3A1A1A',
    barber:      '#1A1A3A',
    cars:        '#3A2A1A',
    modeling:    '#2A1A3A',
    photography: '#1A2A3A',
  }
}
```

### Shape Language — THE DIAMOND
The diamond is SPRTD's visual identity. It comes from the logo. Use it everywhere:
- Tab bar icons are diamond-outlined, fill gold when active
- Buttons use diamond shape where possible, especially CTAs
- Check-in button is a pulsing diamond
- Roster member status indicators are diamond-shaped rings, not circular
- Loading indicator uses the Kufic diamond logo rotating slowly
- Event registration state: filled diamond = registered, outline = not joined

### Typography
- All caps for section headers and labels
- Generous letter spacing (0.1-0.15em) on brand text
- Clean, minimal — no decorative fonts except the Kufic logo

### Spacing
- Base unit: 8px
- Cards: 16px padding, 12px border radius
- Sections: 24px between
- Screen padding: 16px horizontal

---

## SIGNATURE UI ELEMENTS

### KufiyahWeave Component
The most important component in the app. Visualizes Qimah progress toward a HAYBAH unlock.

- Renders as an SVG kufiyah pattern (fishnet and chain stitch)
- Starts completely empty — just the outline
- Fills progressively from edges inward as `currentQimah / requiredQimah` increases
- When requirement is met: full pattern appears, glows gold, HAYBAH unlock triggers
- Different HAYBAH tiers require different fill amounts
- This component lives on the Home screen and the HAYBAH item detail screen
- Never use a standard progress bar where this should be used

### DiamondPulse Component
- Used for the location check-in button
- Pulses slowly when user is within geofence range of a roster location
- Flashes gold and contracts inward on successful check-in
- Dormant (no pulse) when out of range

### RosterRing Component
- Diamond-shaped border around roster member avatars
- Active roster member: solid gold diamond, slow pulse
- Challenged roster member: fractured/dashed diamond in red
- Community member: no ring

### NicheTag Component
- Small pill/tag showing niche name
- Background color matches that niche's color from the color system
- Used on event cards, location cards, roster profiles

---

## QIMAH RULES — CRITICAL

Qimah is the points economy of SPRTD. These rules are non-negotiable:

**Earning Qimah:**
- Purchasing SPRTD pieces
- Check-ins at roster locations
- Participating in events
- Winning events
- Monthly allocation for roster members

**Spending Qimah:**
- Unlocking HAYBAH pieces (3,000–8,000 Qimah)
- Applying to be a roster member (3,000 Qimah)
- Nominating a roster member (500 Qimah)
- Challenging a roster member for their spot (5,000 Qimah)
- Early drop access (1,000 Qimah)
- Priority event registration (500–1,000 Qimah)

**Technical rules:**
- Qimah balance NEVER updates client-side directly
- All earn/spend actions call a Supabase Edge Function that validates, writes the transaction, and updates the balance atomically
- Client reads the balance from the `profiles` table via realtime subscription
- Users cannot inspect or manipulate point values — all logic lives server-side
- Qimah has no monetary value and cannot be converted to discounts or cash

---

## GEOFENCING + CHECK-IN LOGIC

- Use `expo-location` with `startGeofencingAsync`
- Each roster location has a `checkin_radius_meters` (default 150m)
- When user enters the geofence, trigger the `DiamondPulse` on the check-in button
- User must manually tap check-in — it is never automatic
- Check-in is validated server-side: confirm coordinates are within radius before awarding Qimah
- One check-in per user per location per 24 hours maximum
- Check-in history is stored in the `checkins` table

---

## NOTIFICATIONS

Use `expo-notifications` for:
- Event starting soon (24h and 1h before)
- Qimah earned confirmation
- HAYBAH unlock available (when balance crosses threshold)
- Roster challenge received
- New event announced in user's niche interest

---

## NAMING CONVENTIONS — LOCKED

These Arabic names are permanent and must never be changed or translated:
- **Qimah** — the points system (means "value" and "worth")
- **HAYBAH** — the exclusive designer line (means "prestige" and "presence")
- **Al-Muktasab** — the elevated tailored collection

Everything else in the app uses clean English. Do not add Arabic names to features unless explicitly instructed.

---

## WHAT NOT TO DO — NEVER

- Never use circular buttons where a diamond fits
- Never use a standard spinner for loading — always use the rotating Kufic diamond logo
- Never use a standard progress bar for Qimah toward HAYBAH — always use the KufiyahWeave
- Never update Qimah balance from the client side
- Never expose the Supabase secret key
- Never use `npm install` for native packages — always `npx expo install`
- Never use JavaScript files — TypeScript only
- Never add Arabic names to features without explicit instruction
- Never use loud graphics, gradients, or busy backgrounds — prestige through restraint
- Never make circular profile rings for roster members — diamond shape only
- Never assume RLS is configured — always verify before writing data access logic
- Never build admin dashboards unless explicitly requested — manual Supabase dashboard management for now

---

## WHAT TO ALWAYS DO

- Always use TypeScript with strict typing
- Always validate location server-side before awarding check-in Qimah
- Always use the diamond shape language for interactive elements
- Always use niche colors from the color system for niche-specific UI
- Always use `expo-router` file-based routing — no React Navigation setup
- Always keep the KufiyahWeave as the hero visual element on the home screen
- Always handle loading and error states for every async operation
- Always use Supabase Realtime for Qimah balance so it updates live
- Always commit to GitHub after every meaningful feature completion

---

## SEASON STRUCTURE

- SPRTD operates in seasons tied to clothing drops
- Each season has 2-3 events, one per niche
- Events are hosted by the roster member of that niche at a partner location
- Season number is stored on events and HAYBAH items
- Currently in preseason (Phase 2) — public events begin at Season 1 launch

---

## CURRENT PHASE (Phase 2 — Planning)

The app is in beta development. For this phase:
- No admin dashboard needed — manage data directly in Supabase dashboard
- Qimah earning can be partially manual during beta
- Focus on core flows: auth, home screen, events, locations, check-in, Qimah balance
- Roster challenge system can be read-only display for now
- HAYBAH unlock flow must be fully functional at launch

---

## CORE SCREENS PRIORITY ORDER

1. Auth (login/signup) — must work perfectly
2. Home — Qimah balance with KufiyahWeave, upcoming events, recent activity
3. Events — event feed, event detail, registration
4. Locations — map view, location detail with check-in
5. Profile — Qimah balance, transaction history, roster status
6. HAYBAH — item browser, unlock flow
7. Roster — member profiles, niche pages